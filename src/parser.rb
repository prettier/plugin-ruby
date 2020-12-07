#!/usr/bin/env ruby

# We implement our own version checking here instead of using Gem::Version so
# that we can use the --disable-gems flag.
major, minor, * = RUBY_VERSION.split('.').map(&:to_i)

if (major < 2) || ((major == 2) && (minor < 5))
  warn(
    "Ruby version #{RUBY_VERSION} not supported. " \
      'Please upgrade to 2.5.0 or above.'
  )

  exit 1
end

require 'json' unless defined?(JSON)
require 'ripper'

module Prettier; end

class Prettier::Parser < Ripper
  attr_reader :source, :lines, :scanner_events, :line_counts

  def initialize(source, *args)
    super(source, *args)

    @source = source
    @lines = source.split("\n")

    @comments = []
    @embdoc = nil
    @__end__ = nil

    @heredocs = []
  
    @scanner_events = []
    @line_counts = [0]

    @source.lines.each { |line| @line_counts << @line_counts.last + line.size }
  end

  private

  # This represents the current place in the source string that we've gotten to
  # so far. We have a memoized line_counts object that we can use to get the
  # number of characters that we've had to go through to get to the beginning of
  # this line, then we add the number of columns into this line that we've gone
  # through.
  def char_pos
    line_counts[lineno - 1] + column
  end

  # As we build up a list of scanner events, we'll periodically need to go
  # backwards and find the ones that we've already hit in order to determine the
  # location information for nodes that use them. For example, if you have a
  # module node then you'll look backward for a @module scanner event to
  # determine your start location.
  #
  # This works with nesting since we're deleting scanner events from the list
  # once they've been used up. For example if you had nested module declarations
  # then the innermost declaration would grab the last @module event (which
  # would happen to be the innermost keyword). Then the outer one would only be
  # able to grab the first one. In this way all of the scanner events act as
  # their own stack.
  def find_scanner_event(type, body = :any)
    index =
      scanner_events.rindex do |scanner_event|
        scanner_event[:type] == type &&
          (body == :any || (scanner_event[:body] == body))
      end

    scanner_events.delete_at(index)
  end

  # Scanner events occur when the lexer hits a new token, like a keyword or an
  # end. These nodes always contain just one argument which is a string
  # representing the content. For the most part these can just be printed
  # directly, which very few exceptions.
  SCANNER_EVENTS.each do |event|
    define_method(:"on_#{event}") do |value|
      char_end = char_pos + value.size
      node = {
        type: :"@#{event}",
        body: value,
        start: lineno,
        end: lineno,
        char_start: char_pos,
        char_end: char_end
      }

      scanner_events << node
      node
    end
  end

  prepend(
    Module.new do
      private

      # Handles __END__ syntax, which allows individual scripts to keep content
      # after the main ruby code that can be read through DATA. It looks like:
      #
      # foo.bar
      #
      # __END__
      # some other content that isn't normally read by ripper
      def on___end__(*)
        @__end__ = super(lines[lineno..-1].join("\n"))
      end

      # Like comments, we need to force the encoding here so JSON doesn't break.
      def on_ident(value)
        super(value.force_encoding('UTF-8'))
      end

      # Like comments, we need to force the encoding here so JSON doesn't break.
      def on_tstring_content(value)
        super(value.force_encoding('UTF-8'))
      end
    end
  )

  # We keep track of each comment as it comes in and then eventually add
  # them to the top of the generated AST so that prettier can start adding
  # them back into the final representation. Comments come in including
  # their starting pound sign and the newline at the end, so we also chop
  # those off.
  #
  # If there is an encoding magic comment at the top of the file, ripper
  # will actually change into that encoding for the storage of the string.
  # This will break everything, so we need to force the encoding back into
  # UTF-8 so that the JSON library won't break.
  def on_comment(value)
    @comments << {
      type: :@comment,
      value: value[1..-1].chomp.force_encoding('UTF-8'),
      start: lineno,
      end: lineno,
      char_start: char_pos,
      char_end: char_pos + value.length - 1
    }
  end

  # A BEGIN node is a parser event that represents the use of the BEGIN
  # keyword, which hooks into the lifecycle of the interpreter. It's a bit
  # of a legacy from the stream operating days, and gets its inspiration
  # from tools like awk. Whatever is inside the "block" will get executed
  # when the program starts. The syntax looks like the following:
  #
  #     BEGIN {
  #       # execute stuff here
  #     }
  #
  def on_BEGIN(stmts)
    beging = find_scanner_event(:@lbrace)
    ending = find_scanner_event(:@rbrace)

    stmts.merge!(
      start: beging[:end],
      char_start: beging[:char_end],
      end: ending[:start],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    find_scanner_event(:@kw, 'BEGIN').merge!(
      type: :BEGIN,
      body: [stmts],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # A END node is a parser event that represents the use of the END keyword,
  # which hooks into the lifecycle of the interpreter. It's a bit of a
  # legacy from the stream operating days, and gets its inspiration from
  # tools like awk. Whatever is inside the "block" will get executed when
  # the program ends. The syntax looks like the following:
  #
  #     END {
  #       # execute stuff here
  #     }
  #
  def on_END(stmts)
    beging = find_scanner_event(:@lbrace)
    ending = find_scanner_event(:@rbrace)

    stmts.merge!(
      start: beging[:end],
      char_start: beging[:char_end],
      end: ending[:start],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    find_scanner_event(:@kw, 'END').merge!(
      type: :END,
      body: [stmts],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # alias is a parser event that represents when you're using the alias
  # keyword with regular arguments. This can be either symbol literals or
  # bare words. You can optionally use parentheses with this keyword, so we
  # either track the location information based on those or the final
  # argument to the alias method.
  def on_alias(left, right)
    beging = find_scanner_event(:@kw, 'alias')

    paren = source[beging[:char_end]...left[:char_start]].include?('(')
    ending = paren ? find_scanner_event(:@rparen) : right

    {
      type: :alias,
      body: [left, right],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # aref nodes are when you're pulling a value out of a collection at a
  # specific index. Put another way, it's any time you're calling the method
  # #[]. As an example:
  #
  #     foo[index]
  #
  # The nodes usually contains two children, the collection and the index.
  # In some cases, you don't necessarily have the second child node, because
  # you can call procs with a pretty esoteric syntax. In the following
  # example, you wouldn't have a second child, and "foo" would be the first
  # child:
  #
  #     foo[]
  #
  def on_aref(collection, index)
    find_scanner_event(:@lbracket)
    ending = find_scanner_event(:@rbracket)

    {
      type: :aref,
      body: [collection, index],
      start: collection[:start],
      char_start: collection[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # aref_field is a parser event that is very similar to aref except that it
  # is being used inside of an assignment.
  def on_aref_field(collection, index)
    find_scanner_event(:@lbracket)
    ending = find_scanner_event(:@rbracket)

    {
      type: :aref,
      body: [collection, index],
      start: collection[:start],
      char_start: collection[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # args_new is a parser event that represents the beginning of a list of
  # arguments to any method call or an array. It can be followed by any
  # number of args_add events, which we'll append onto an array body.
  def on_args_new
    {
      type: :args,
      body: [],
      start: lineno,
      char_start: char_pos,
      end: lineno,
      char_end: char_pos
    }
  end

  # args_add is a parser event that represents a single argument inside a
  # list of arguments to any method call or an array. It accepts as
  # arguments the parent args node as well as an arg which can be anything
  # that could be passed as an argument.
  def on_args_add(args, arg)
    if args[:body].empty?
      arg.merge(type: :args, body: [arg])
    else
      args.merge!(
        body: args[:body] << arg,
        end: arg[:end],
        char_end: arg[:char_end]
      )
    end
  end

  # args_add_block is a parser event that represents a list of arguments and
  # potentially a block argument. If no block is passed, then the second
  # argument will be false.
  def on_args_add_block(args, block)
    ending = block || args

    args.merge(
      type: :args_add_block,
      body: [args, block],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # args_add_star is a parser event that represents adding a splat of values
  # to a list of arguments. If accepts as arguments the parent args node as
  # well as the part that is being splatted.
  def on_args_add_star(args, part)
    beging = find_scanner_event(:@op, '*')
    ending = part || beging

    {
      type: :args_add_star,
      body: [args, part],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # args_forward is a parser event that represents forwarding all kinds of
  # arguments onto another method call.
  def on_args_forward
    find_scanner_event(:@op, '...').merge!(type: :args_forward)
  end

  # arg_paren is a parser event that represents wrapping arguments to a
  # method inside a set of parentheses.
  def on_arg_paren(args)
    beging = find_scanner_event(:@lparen)
    ending = find_scanner_event(:@rparen)

    {
      type: :arg_paren,
      body: [args],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # Array nodes can contain a myriad of subnodes because of the special
  # array literal syntax like %w and %i. As a result, we may be looking for
  # an left bracket, or we may be just looking at the children to get the
  # bounds.
  def on_array(contents)
    if !contents || %i[args args_add_star].include?(contents[:type])
      beging = find_scanner_event(:@lbracket)
      ending = find_scanner_event(:@rbracket)

      {
        type: :array,
        body: [contents],
        start: beging[:start],
        char_start: beging[:char_start],
        end: ending[:end],
        char_end: ending[:char_end]
      }
    else
      ending = find_scanner_event(:@tstring_end)
      contents[:char_end] = ending[:char_end]

      ending.merge!(
        type: :array,
        body: [contents],
        start: contents[:start],
        char_start: contents[:char_start]
      )
    end
  end

  # assign is a parser event that represents assigning something to a
  # variable or constant. It accepts as arguments the left side of the
  # expression before the equals sign and the right side of the expression.
  def on_assign(left, right)
    left.merge(
      type: :assign,
      body: [left, right],
      end: right[:end],
      char_end: right[:char_end]
    )
  end

  # assoc_new is a parser event that contains a key-value pair within a
  # hash. It is a child event of either an assoclist_from_args or a
  # bare_assoc_hash.
  def on_assoc_new(key, value)
    {
      type: :assoc_new,
      body: [key, value],
      start: key[:start],
      char_start: key[:char_start],
      end: value[:end],
      char_end: value[:char_end]
    }
  end

  # assoc_splat is a parser event that represents splatting a value into a
  # hash (either a hash literal or a bare hash in a method call).
  def on_assoc_splat(contents)
    find_scanner_event(:@op, '**').merge!(
      type: :assoc_splat,
      body: [contents],
      end: contents[:end],
      char_end: contents[:char_end]
    )
  end

  # assoclist_from_args is a parser event that contains a list of all of the
  # associations inside of a hash literal. Its parent node is always a hash.
  # It accepts as an argument an array of assoc events (either assoc_new or
  # assoc_splat).
  def on_assoclist_from_args(assocs)
    {
      type: :assoclist_from_args,
      body: assocs,
      start: assocs[0][:start],
      char_start: assocs[0][:char_start],
      end: assocs[-1][:end],
      char_end: assocs[-1][:char_end]
    }
  end

  # bare_assoc_hash is a parser event that represents a hash of contents
  # being passed as a method argument (and therefore has omitted braces). It
  # accepts as an argument an array of assoc events (either assoc_new or
  # assoc_splat).
  def on_bare_assoc_hash(assoc_news)
    {
      type: :bare_assoc_hash,
      body: assoc_news,
      start: assoc_news[0][:start],
      char_start: assoc_news[0][:char_start],
      end: assoc_news[-1][:end],
      char_end: assoc_news[-1][:char_end]
    }
  end

  # begin is a parser event that represents the beginning of a begin..end chain.
  # It includes a bodystmt event that has all of the consequent clauses.
  def on_begin(bodystmt)
    find_scanner_event(:@kw, 'begin').merge!(
      type: :begin,
      body: [bodystmt],
      end: bodystmt[:end],
      char_end: bodystmt[:char_end]
    )
  end

  # binary is a parser event that represents a binary operation between two
  # values.
  def on_binary(left, oper, right)
    {
      type: :binary,
      body: [left, oper, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # block_var is a parser event that represents the parameters being passed to
  # block. Effectively they're everything contained within the pipes.
  def on_block_var(params, locals)
    index =
      scanner_events.rindex do |event|
        event[:type] == :@op &&
          %w[| ||].include?(event[:body]) &&
          event[:char_start] < params[:char_start]
      end

    beging = scanner_events[index]
    ending = scanner_events[-1]

    {
      type: :block_var,
      body: [params, locals],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # blockarg is a parser event that represents defining a block variable on
  # a method definition.
  def on_blockarg(ident)
    find_scanner_event(:@op, '&').merge!(
      type: :blockarg,
      body: [ident],
      end: ident[:end],
      char_end: ident[:char_end]
    )
  end

  # bodystmt is a parser event that represents all of the possible combinations
  # of clauses within the body of a method or block.
  def on_bodystmt(stmts, rescued, ensured, elsed)
    pieces = [stmts, rescued, ensured, elsed].compact

    {
      type: :bodystmt,
      body: [stmts, rescued, ensured, elsed],
      start: pieces[0][:start],
      char_start: pieces[0][:char_start],
      end: pieces[-1][:end],
      char_end: pieces[-1][:char_end]
    }
  end

  # brace_block is a parser event that represents passing a block to a
  # method call using the {..} operators. It accepts as arguments an
  # optional block_var event that represents any parameters to the block as
  # well as a stmts event that represents the statements inside the block.
  def on_brace_block(block_var, stmts)
    beging = find_scanner_event(:@lbrace)
    ending = find_scanner_event(:@rbrace)

    stmts.merge!(
      char_start: (block_var || beging)[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :brace_block,
      body: [block_var, stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # break is a parser event that represents using the break keyword. It
  # accepts as an argument an args or args_add_block event that contains all
  # of the arguments being passed to the break.
  def on_break(args_add_block)
    find_scanner_event(:@kw, 'break').merge!(
      type: :break,
      body: [args_add_block],
      end: args_add_block[:end],
      char_end: args_add_block[:char_end]
    )
  end

  # call is a parser event representing a method call with no arguments. It
  # accepts as arguments the receiver of the method, the operator being used
  # to send the method (., ::, or &.), and the value that is being sent to
  # the receiver (which can be another nested call as well).
  #
  # There is one esoteric syntax that comes into play here as well. If the
  # sending argument to this method is the symbol :call, then it represents
  # calling a lambda in a very odd looking way, as in:
  #
  #     foo.(1, 2, 3)
  #
  def on_call(receiver, oper, sending)
    ending = sending == :call ? oper : sending

    {
      type: :call,
      body: [receiver, oper, sending],
      start: receiver[:start],
      char_start: receiver[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # case is a parser event that represents the beginning of a case chain.
  # It accepts as arguments the switch of the case and the consequent
  # clause.
  def on_case(switch, consequent)
    find_scanner_event(:@kw, 'case').merge!(
      type: :case,
      body: [switch, consequent],
      end: consequent[:end],
      char_end: consequent[:char_end]
    )
  end

  # class is a parser event that represents defining a class. It accepts as
  # arguments the name of the class, the optional name of the superclass,
  # and the bodystmt event that represents the statements evaluated within
  # the context of the class.
  def on_class(const, superclass, bodystmt)
    beging = find_scanner_event(:@kw, 'class')
    ending = find_scanner_event(:@kw, 'end')

    range = {
      char_start: (superclass || const)[:char_end],
      char_end: ending[:char_start]
    }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :class,
      body: [const, superclass, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # command is a parser event representing a method call with arguments and
  # no parentheses. It accepts as arguments the name of the method and the
  # arguments being passed to the method.
  def on_command(ident, args)
    {
      type: :command,
      body: [ident, args],
      start: ident[:start],
      char_start: ident[:char_start],
      end: args[:end],
      char_end: args[:char_end]
    }
  end

  # command_call is a parser event representing a method call on an object
  # with arguments and no parentheses. It accepts as arguments the receiver
  # of the method, the operator being used to send the method, the name of
  # the method, and the arguments being passed to the method.
  def on_command_call(receiver, oper, ident, args)
    ending = args || ident

    {
      type: :command_call,
      body: [receiver, oper, ident, args],
      start: receiver[:start],
      char_start: receiver[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # A const_path_field is a parser event that is always the child of some
  # kind of assignment. It represents when you're assigning to a constant
  # that is being referenced as a child of another variable. For example:
  #
  #     foo::X = 1
  #
  def on_const_path_field(left, const)
    {
      type: :const_path_field,
      body: [left, const],
      start: left[:start],
      char_start: left[:char_start],
      end: const[:end],
      char_end: const[:char_end]
    }
  end

  # A const_path_ref is a parser event that is a very similar to
  # const_path_field except that it is not involved in an assignment. It
  # looks like the following example:
  #
  #     foo::X
  #
  def on_const_path_ref(left, const)
    {
      type: :const_path_ref,
      body: [left, const],
      start: left[:start],
      char_start: left[:char_start],
      end: const[:end],
      char_end: const[:char_end]
    }
  end

  # A const_ref is a parser event that represents the name of the constant
  # being used in a class or module declaration. In the following example it
  # is the @const scanner event that has the contents of Foo.
  #
  #     class Foo; end
  #
  def on_const_ref(const)
    const.merge(type: :const_ref, body: [const])
  end

  # A def is a parser event that represents defining a regular method on the
  # current self object. It accepts as arguments the ident (the name of the
  # method being defined), the params (the parameter declaration for the
  # method), and a bodystmt node which represents the statements inside the
  # method. As an example, here are the parts that go into this:
  #
  #     def foo(bar) do baz end
  #          │   │       │
  #          │   │       └> bodystmt
  #          │   └> params
  #          └> ident
  #
  def on_def(ident, params, bodystmt)
    if params[:type] == :params && !params[:body].any?
      location = ident[:char_end]
      params.merge!(char_start: location, char_end: location)
    end

    beging = find_scanner_event(:@kw, 'def')
    ending = find_scanner_event(:@kw, 'end')
    range = { char_start: params[:char_end], char_end: ending[:char_start] }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :def,
      body: [ident, params, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # A defs is a parser event that represents defining a singleton method on
  # an object. It accepts the same arguments as the def event, as well as
  # the target and operator that on which this method is being defined. As
  # an example, here are the parts that go into this:
  #
  #     def foo.bar(baz) do baz end
  #          │ │ │   │       │
  #          │ │ │   │       │
  #          │ │ │   │       └> bodystmt
  #          │ │ │   └> params
  #          │ │ └> ident
  #          │ └> oper 
  #          └> target
  #
  def on_defs(target, oper, ident, params, bodystmt)
    if params[:type] == :params && !params[:body].any?
      location = ident[:char_end]
      params.merge!(char_start: location, char_end: location)
    end

    beging = find_scanner_event(:@kw, 'def')
    ending = find_scanner_event(:@kw, 'end')
    range = { char_start: params[:char_end], char_end: ending[:char_start] }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :defs,
      body: [target, oper, ident, params, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # A defined node represents the rather unique defined? operator. It can be
  # used with and without parentheses. If they're present, we use them to
  # determine our bounds, otherwise we use the value that's being passed to
  # the operator.
  def on_defined(value)
    beging = find_scanner_event(:@kw, 'defined?')

    paren = source[beging[:char_end]...value[:char_start]].include?('(')
    ending = paren ? find_scanner_event(:@rparen) : value

    beging.merge!(
      type: :defined,
      body: [value],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # do_block is a parser event that represents passing a block to a method
  # call using the do..end keywords. It accepts as arguments an optional
  # block_var event that represents any parameters to the block as well as
  # a bodystmt event that represents the statements inside the block.
  def on_do_block(block_var, bodystmt)
    beging = find_scanner_event(:@kw, 'do')
    ending = find_scanner_event(:@kw, 'end')

    range = {
      char_start: (block_var || beging)[:char_end],
      char_end: ending[:char_start]
    }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :do_block,
      body: [block_var, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # dot2 is a parser event that represents using the .. operator between two
  # expressions. Usually this is to create a range object but sometimes it's to
  # use the flip-flop operator.
  def on_dot2(left, right)
    {
      type: :dot2,
      body: [left, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # dot3 is a parser event that represents using the ... operator between two
  # expressions. Usually this is to create a range object but sometimes it's to
  # use the flip-flop operator.
  def on_dot3(left, right)
    {
      type: :dot3,
      body: [left, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # A dyna_symbol is a parser event that represents a symbol literal that
  # uses quotes to interpolate its value. For example, if you had a variable
  # foo and you wanted a symbol that contained its value, you would write:
  #
  #     :"#{foo}"
  #
  # As such, they accept as one argument a string node, which is the same
  # node that gets accepted into a string_literal (since we're basically
  # talking about a string literal with a : character at the beginning).
  #
  # They can also come in another flavor which is a dynamic symbol as a hash
  # key. This is kind of an interesting syntax which results in us having to
  # look for a @label_end scanner event instead to get our bearings. That
  # kind of code would look like:
  #
  #     { "#{foo}": bar }
  #
  # which would be the same symbol as above.
  def on_dyna_symbol(string)
    if scanner_events.any? { |event| event[:type] == :@symbeg }
      # A normal dynamic symbol
      beging = find_scanner_event(:@symbeg)
      ending = find_scanner_event(:@tstring_end)

      beging.merge(
        type: :dyna_symbol,
        quote: beging[:body][1],
        body: string[:body],
        end: ending[:end],
        char_end: ending[:char_end]
      )
    else
      # A dynamic symbol as a hash key
      beging = find_scanner_event(:@tstring_beg)
      ending = find_scanner_event(:@label_end)

      string.merge!(
        type: :dyna_symbol,
        quote: ending[:body][0],
        start: beging[:start],
        char_start: beging[:char_start],
        end: ending[:end],
        char_end: ending[:char_end]
      )
    end
  end

  # else is a parser event that represents the end of a if, unless, or begin
  # chain. It accepts as an argument the statements that are contained
  # within the else clause.
  def on_else(stmts)
    beging = find_scanner_event(:@kw, 'else')
    ending = find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: beging[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :else,
      body: [stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # elsif is a parser event that represents another clause in an if chain.
  # It accepts as arguments the predicate of the else if, the statements
  # that are contained within the else if clause, and the optional
  # consequent clause.
  def on_elsif(predicate, stmts, consequent)
    beging = find_scanner_event(:@kw, 'elsif')
    ending = consequent || find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :elsif,
      body: [predicate, stmts, consequent],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # embdocs are long comments that are surrounded by =begin..=end. They
  # cannot be nested, so we don't need to worry about keeping a stack around
  # like we do with heredocs. Instead we can just track the current embdoc
  # and add to it as we get content. It always starts with this scanner
  # event, so here we'll initialize the current embdoc.
  def on_embdoc_beg(value)
    @embdoc = {
      type: :@embdoc,
      value: value,
      start: lineno,
      char_start: char_pos
    }
  end

  # This is a scanner event that gets hit when we're inside an embdoc and
  # receive a new line of content. Here we are guaranteed to already have
  # initialized the @embdoc variable so we can just append the new line onto
  # the existing content.
  def on_embdoc(value)
    @embdoc[:value] << value
  end

  # This is the final scanner event for embdocs. It receives the =end. Here
  # we can finalize the embdoc with its location information and the final
  # piece of the string. We then add it to the list of comments so that
  # prettier can place it into the final source string.
  def on_embdoc_end(value)
    @comments << @embdoc.merge!(
      value: @embdoc[:value] << value.chomp,
      end: lineno,
      char_end: char_pos + value.length - 1
    )

    @embdoc = nil
  end

  # ensure is a parser event that represents the use of the ensure keyword
  # and its subsequent statements.
  def on_ensure(stmts)
    beging = find_scanner_event(:@kw, 'ensure')
    ending = find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: beging[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :ensure,
      body: [stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  def on_excessed_comma
    find_scanner_event(:@comma).merge!(type: :excessed_comma)
  end

  # An fcall is a parser event that represents the piece of a method call
  # that comes before any arguments (i.e., just the name of the method).
  def on_fcall(ident)
    ident.merge(type: :fcall, body: [ident])
  end

  # A field is a parser event that is always the child of an assignment. It
  # accepts as arguments the left side of operation, the operator (. or ::),
  # and the right side of the operation. For example:
  #
  #     foo.x = 1
  #
  def on_field(left, oper, right)
    {
      type: :field,
      body: [left, oper, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # for is a parser event that represents using the somewhat esoteric for
  # loop. It accepts as arguments an ident which is the iterating variable,
  # an enumerable for that which is being enumerated, and a stmts event that
  # represents the statements inside the for loop.
  def on_for(ident, enumerable, stmts)
    beging = find_scanner_event(:@kw, 'for')
    ending = find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: enumerable[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :for,
      body: [ident, enumerable, stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # hash is a parser event that represents a hash literal. It accepts as an
  # argument an optional assoclist_from_args event which contains the
  # contents of the hash.
  def on_hash(assoclist_from_args)
    beging = find_scanner_event(:@lbrace)
    ending = find_scanner_event(:@rbrace)

    {
      type: :hash,
      body: [assoclist_from_args],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # This is a scanner event that represents the beginning of the heredoc. It
  # includes the declaration (which we call beging here, which is just short
  # for beginning). The declaration looks something like <<-HERE or <<~HERE.
  # If the downcased version of the declaration actually matches an existing
  # prettier parser, we'll later attempt to print it using that parser and
  # printer through our embed function.
  def on_heredoc_beg(beging)
    {
      type: :heredoc,
      beging: beging,
      start: lineno,
      end: lineno,
      char_start: char_pos - beging.length + 1,
      char_end: char_pos
    }.tap { |node| @heredocs << node }
  end

  # This is a parser event that occurs when you're using a heredoc with a
  # tilde. These are considered `heredoc_dedent` nodes, whereas the hyphen
  # heredocs show up as string literals.
  def on_heredoc_dedent(string, _width)
    @heredocs[-1].merge!(string.slice(:body))
  end

  # This is a scanner event that represents the end of the heredoc.
  def on_heredoc_end(ending)
    @heredocs[-1].merge!(
      ending: ending.chomp, end: lineno, char_end: char_pos
    )
  end

  # if is a parser event that represents the first clause in an if chain.
  # It accepts as arguments the predicate of the if, the statements that are
  # contained within the if clause, and the optional consequent clause.
  def on_if(predicate, stmts, consequent)
    beging = find_scanner_event(:@kw, 'if')
    ending = consequent || find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :if,
      body: [predicate, stmts, consequent],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # ifop is a parser event that represents a ternary operator. It accepts as
  # arguments the predicate to the ternary, the truthy clause, and the falsy
  # clause.
  def on_ifop(predicate, truthy, falsy)
    predicate.merge(
      type: :ifop,
      body: [predicate, truthy, falsy],
      end: falsy[:end],
      char_end: falsy[:char_end]
    )
  end

  # if_mod is a parser event that represents the modifier form of an if
  # statement. It accepts as arguments the predicate of the if and the
  # statement that are contained within the if clause.
  def on_if_mod(predicate, statement)
    find_scanner_event(:@kw, 'if')

    {
      type: :if_mod,
      body: [predicate, statement],
      start: statement[:start],
      char_start: statement[:char_start],
      end: predicate[:end],
      char_end: predicate[:char_end]
    }
  end

  # kwrest_param is a parser event that represents defining a parameter in a
  # method definition that accepts all remaining keyword parameters.
  def on_kwrest_param(ident)
    oper = find_scanner_event(:@op, '**')
    return oper.merge!(type: :kwrest_param, body: [nil]) unless ident

    oper.merge!(
      type: :kwrest_param,
      body: [ident],
      end: ident[:end],
      char_end: ident[:char_end]
    )
  end

  # lambda is a parser event that represents using a "stabby" lambda
  # literal. It accepts as arguments a params event that represents any
  # parameters to the lambda and a stmts event that represents the
  # statements inside the lambda.
  #
  # It can be wrapped in either {..} or do..end so we look for either of
  # those combinations to get our bounds.
  def on_lambda(params, stmts)
    beging = find_scanner_event(:@tlambda)

    if scanner_events.any? { |event| event[:type] == :@tlambeg }
      opening = find_scanner_event(:@tlambeg)
      closing = find_scanner_event(:@rbrace)
    else
      opening = find_scanner_event(:@kw, 'do')
      closing = find_scanner_event(:@kw, 'end')
    end

    stmts.merge!(
      char_start: opening[:char_end],
      char_end: closing[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: closing[:char_start],
        char_end: closing[:char_start]
      )
    end

    {
      type: :lambda,
      body: [params, stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: closing[:end],
      char_end: closing[:char_end]
    }
  end

  # massign is a parser event that is a parent node of any kind of multiple
  # assignment. This includes splitting out variables on the left like:
  #
  #     a, b, c = foo
  #
  # as well as splitting out variables on the right, as in:
  #
  #     foo = a, b, c
  #
  # Both sides support splats, as well as variables following them. There's
  # also slightly odd behavior that you can achieve with the following:
  #
  #     a, = foo
  #
  # In this case a would receive only the first value of the foo enumerable,
  # in which case we need to explicitly track the comma and add it onto the
  # child node.
  def on_massign(left, right)
    if source[left[:char_end]...right[:char_start]].strip.start_with?(',')
      left[:comma] = true
    end

    {
      type: :massign,
      body: [left, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # method_add_arg is a parser event that represents a method call with
  # arguments and parentheses. It accepts as arguments the method being called
  # and the arg_paren event that contains the arguments to the method.
  def on_method_add_arg(fcall, arg_paren)
    {
      type: :method_add_arg,
      body: [fcall, arg_paren],
      start: fcall[:start],
      char_start: fcall[:char_start],
      end: arg_paren[:end],
      char_end: arg_paren[:char_end]
    }
  end

  # method_add_block is a parser event that represents a method call with a
  # block argument. It accepts as arguments the method being called and the
  # block event.
  def on_method_add_block(method_add_arg, block)
    {
      type: :method_add_block,
      body: [method_add_arg, block],
      start: method_add_arg[:start],
      char_start: method_add_arg[:char_start],
      end: block[:end],
      char_end: block[:char_end]
    }
  end

  # An mlhs_new is a parser event that represents the beginning of the left
  # side of a multiple assignment. It is followed by any number of mlhs_add
  # nodes that each represent another variable being assigned.
  def on_mlhs_new
    {
      type: :mlhs,
      body: [],
      start: lineno,
      char_start: char_pos,
      end: lineno,
      char_end: char_pos
    }
  end

  # An mlhs_add is a parser event that represents adding another variable
  # onto a list of assignments. It accepts as arguments the parent mlhs node
  # as well as the part that is being added to the list.
  def on_mlhs_add(mlhs, part)
    if mlhs[:body].empty?
      part.merge(type: :mlhs, body: [part])
    else
      mlhs.merge!(
        body: mlhs[:body] << part,
        end: part[:end],
        char_end: part[:char_end]
      )
    end
  end

  # An mlhs_add_post is a parser event that represents adding another set of
  # variables onto a list of assignments after a splat variable. It accepts
  # as arguments the previous mlhs_add_star node that represented the splat
  # as well another mlhs node that represents all of the variables after the
  # splat.
  def on_mlhs_add_post(mlhs_add_star, mlhs)
    mlhs_add_star.merge(
      type: :mlhs_add_post,
      body: [mlhs_add_star, mlhs],
      end: mlhs[:end],
      char_end: mlhs[:char_end]
    )
  end

  # An mlhs_add_star is a parser event that represents a splatted variable
  # inside of a multiple assignment on the left hand side. It accepts as
  # arguments the parent mlhs node as well as the part that represents the
  # splatted variable.
  def on_mlhs_add_star(mlhs, part)
    beging = find_scanner_event(:@op, '*')
    ending = part || beging

    {
      type: :mlhs_add_star,
      body: [mlhs, part],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # An mlhs_paren is a parser event that represents parentheses being used
  # to deconstruct values in a multiple assignment on the left hand side. It
  # accepts as arguments the contents of the inside of the parentheses,
  # which is another mlhs node.
  def on_mlhs_paren(contents)
    beging = find_scanner_event(:@lparen)
    ending = find_scanner_event(:@rparen)

    if source[beging[:char_end]...ending[:char_start]].strip.end_with?(',')
      contents[:comma] = true
    end

    {
      type: :mlhs_paren,
      body: [contents],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # module is a parser event that represents defining a module. It accepts
  # as arguments the name of the module and the bodystmt event that
  # represents the statements evaluated within the context of the module.
  def on_module(const, bodystmt)
    beging = find_scanner_event(:@kw, 'module')
    ending = find_scanner_event(:@kw, 'end')

    range = { char_start: const[:char_end], char_end: ending[:char_start] }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :module,
      body: [const, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # An mrhs_new is a parser event that represents the beginning of a list of
  # values that are being assigned within a multiple assignment node. It can
  # be followed by any number of mrhs_add nodes that we'll build up into an
  # array body.
  def on_mrhs_new
    {
      type: :mrhs,
      body: [],
      start: lineno,
      char_start: char_pos,
      end: lineno,
      char_end: char_pos
    }
  end

  # An mrhs_add is a parser event that represents adding another value onto
  # a list on the right hand side of a multiple assignment.
  def on_mrhs_add(mrhs, part)
    if mrhs[:body].empty?
      part.merge(type: :mrhs, body: [part])
    else
      mrhs.merge!(
        body: mrhs[:body] << part,
        end: part[:end],
        char_end: part[:char_end]
      )
    end
  end

  # An mrhs_add_star is a parser event that represents using the splat
  # operator to expand out a value on the right hand side of a multiple
  # assignment.
  def on_mrhs_add_star(mrhs, part)
    beging = find_scanner_event(:@op, '*')
    ending = part || beging

    {
      type: :mrhs_add_star,
      body: [mrhs, part],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # An mrhs_new_from_args is a parser event that represents the shorthand
  # of a multiple assignment that allows you to assign values using just
  # commas as opposed to assigning from an array. For example, in the
  # following segment the right hand side of the assignment would trigger
  # this event:
  #
  #     foo = 1, 2, 3
  #
  def on_mrhs_new_from_args(args)
    args.merge(type: :mrhs_new_from_args, body: [args])
  end

  # next is a parser event that represents using the next keyword. It
  # accepts as an argument an args or args_add_block event that contains all
  # of the arguments being passed to the next.
  def on_next(args_add_block)
    find_scanner_event(:@kw, 'next').merge!(
      type: :next,
      body: [args_add_block],
      end: args_add_block[:end],
      char_end: args_add_block[:char_end]
    )
  end

  # opassign is a parser event that represents assigning something to a
  # variable or constant using an operator like += or ||=. It accepts as
  # arguments the left side of the expression before the operator, the
  # operator itself, and the right side of the expression.
  def on_opassign(left, oper, right)
    left.merge(
      type: :opassign,
      body: [left, oper, right],
      end: right[:end],
      char_end: right[:char_end]
    )
  end

  # params is a parser event that represents defining parameters on a
  # method. They have a somewhat interesting structure in that they are an
  # array of arrays where the position in the top-level array indicates the
  # type of param and the subarray is the list of parameters of that type.
  # We therefore have to flatten them down to get to the location.
  def on_params(*types)
    flattened = types.flatten(2).select(&:itself)
    location =
      if flattened.any?
        {
          start: flattened[0][:start],
          char_start: flattened[0][:char_start],
          end: flattened[-1][:end],
          char_end: flattened[-1][:char_end]
        }
      else
        {
          start: lineno,
          char_start: char_pos,
          end: lineno,
          char_end: char_pos
        }
      end

    location.merge!(type: :params, body: types)
  end

  # A paren is a parser event that represents using parentheses pretty much
  # anywhere in a Ruby program. It accepts as arguments the contents, which
  # can be either params or statements.
  def on_paren(contents)
    ending = find_scanner_event(:@rparen)

    find_scanner_event(:@lparen).merge!(
      type: :paren,
      body: [contents],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # The program node is the very top of the AST. Here we'll attach all of
  # the comments that we've gathered up over the course of parsing the
  # source string. We'll also attach on the __END__ content if there was
  # some found at the end of the source string.
  def on_program(stmts)
    range = {
      start: 1,
      end: lines.length,
      char_start: 0,
      char_end: source.length
    }

    stmts[:body] << @__end__ if @__end__
    stmts.merge!(range)

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: source.length,
        char_end: source.length
      )
    end

    range.merge(
      type: :program,
      body: [stmts],
      comments: @comments
    )
  end

  # qsymbols_new is a parser event that represents the beginning of a symbol
  # literal array, like %i[one two three]. It can be followed by any number
  # of qsymbols_add events, which we'll append onto an array body.
  def on_qsymbols_new
    find_scanner_event(:@qsymbols_beg).merge!(type: :qsymbols, body: [])
  end

  # qsymbols_add is a parser event that represents an element inside of a
  # symbol literal array like %i[one two three]. It accepts as arguments the
  # parent qsymbols node as well as a tstring_content scanner event
  # representing the bare words.
  def on_qsymbols_add(qsymbols, tstring_content)
    qsymbols.merge!(
      body: qsymbols[:body] << tstring_content,
      end: tstring_content[:end],
      char_end: tstring_content[:char_end]
    )
  end

  # qwords_new is a parser event that represents the beginning of a string
  # literal array, like %w[one two three]. It can be followed by any number
  # of qwords_add events, which we'll append onto an array body.
  def on_qwords_new
    find_scanner_event(:@qwords_beg).merge!(type: :qwords, body: [])
  end

  # qsymbols_add is a parser event that represents an element inside of a
  # symbol literal array like %i[one two three]. It accepts as arguments the
  # parent qsymbols node as well as a tstring_content scanner event
  # representing the bare words.
  def on_qwords_add(qwords, tstring_content)
    qwords.merge!(
      body: qwords[:body] << tstring_content,
      end: tstring_content[:end],
      char_end: tstring_content[:char_end]
    )
  end

  # redo is a parser event that represents the bare redo keyword. It has no
  # body as it accepts no arguments.
  def on_redo
    find_scanner_event(:@kw, 'redo').merge!(type: :redo)
  end

  # regexp_new is a parser event that represents the beginning of a regular
  # expression literal, like /foo/. It can be followed by any number of
  # regexp_add events, which we'll append onto an array body.
  def on_regexp_new
    find_scanner_event(:@regexp_beg).merge!(type: :regexp, body: [])
  end

  # regexp_add is a parser event that represents a piece of a regular
  # body. It accepts as arguments the parent regexp node as well as a
  # tstring_content scanner event representing string content or a
  # string_embexpr parser event representing interpolated content.
  def on_regexp_add(regexp, piece)
    regexp.merge!(
      body: regexp[:body] << piece,
      end: regexp[:end],
      char_end: regexp[:char_end]
    )
  end

  # regexp_literal is a parser event that represents a regular expression.
  # It accepts as arguments a regexp node which is a built-up array of
  # pieces that go into the regexp content, as well as the ending used to
  # close out the regexp which includes any modifiers.
  def on_regexp_literal(regexp, ending)
    regexp.merge!(
      type: :regexp_literal,
      ending: ending[:body],
      end: ending[:end],
      char_end: ending[:char_end]
    )
  end

  # rescue_mod represents the modifier form of a rescue clause. It accepts as
  # arguments the statement that may raise an error and the value that should
  # be used if it does.
  def on_rescue_mod(statement, rescued)
    find_scanner_event(:@kw, 'rescue')

    {
      type: :rescue_mod,
      body: [statement, rescued],
      start: statement[:start],
      char_start: statement[:char_start],
      end: rescued[:end],
      char_end: rescued[:char_end]
    }
  end

  # rest_param is a parser event that represents defining a parameter in a
  # method definition that accepts all remaining positional parameters. It
  # accepts as an argument an optional identifier for the parameter. If it
  # is omitted, then we're just using the plain operator.
  def on_rest_param(ident)
    oper = find_scanner_event(:@op, '*')
    return oper.merge!(type: :rest_param, body: [nil]) unless ident

    oper.merge!(
      type: :rest_param,
      body: [ident],
      end: ident[:end],
      char_end: ident[:char_end]
    )
  end

  # retry is a parser event that represents the bare retry keyword. It has
  # no body as it accepts no arguments.
  def on_retry
    find_scanner_event(:@kw, 'retry').merge!(type: :retry)
  end

  # return is a parser event that represents using the return keyword with
  # arguments. It accepts as an argument an args_add_block event that
  # contains all of the arguments being passed.
  def on_return(args_add_block)
    find_scanner_event(:@kw, 'return').merge!(
      type: :return,
      body: [args_add_block],
      end: args_add_block[:end],
      char_end: args_add_block[:char_end]
    )
  end

  # return0 is a parser event that represents the bare return keyword. It
  # has no body as it accepts no arguments. This is as opposed to the return
  # parser event, which is the version where you're returning one or more
  # values.
  def on_return0
    find_scanner_event(:@kw, 'return').merge!(type: :return0)
  end

  # sclass is a parser event that represents a block of statements that
  # should be evaluated within the context of the singleton class of an
  # object. It's frequently used to define singleton methods. It looks like
  # the following example:
  #
  #     class << self do foo end
  #               │       │
  #               │       └> bodystmt
  #               └> target
  #
  def on_sclass(target, bodystmt)
    beging = find_scanner_event(:@kw, 'class')
    ending = find_scanner_event(:@kw, 'end')

    range = { char_start: target[:char_end], char_end: ending[:char_start] }

    bodystmt.merge!(range)
    stmts, *others = bodystmt[:body]

    unless others.any?
      stmts.merge!(range)

      # If the only statement inside the list of statements is a void
      # statement, then just shove it to the end.
      if stmts[:body][0][:type] == :void_stmt
        stmts[:body][0].merge!(
          char_start: ending[:char_start],
          char_end: ending[:char_start]
        )
      end
    end

    {
      type: :sclass,
      body: [target, bodystmt],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # stmts_new is a parser event that represents the beginning of a list of
  # statements within any lexical block. It can be followed by any number of
  # stmts_add events, which we'll append onto an array body.
  def on_stmts_new
    {
      type: :stmts,
      body: [],
      start: lineno,
      char_start: char_pos,
      end: lineno,
      char_end: char_pos
    }
  end

  # stmts_add is a parser event that represents a single statement inside a
  # list of statements within any lexical block. It accepts as arguments the 
  # parent stmts node as well as an stmt which can be any expression in
  # Ruby.
  def on_stmts_add(stmts, stmt)
    if stmts[:body].empty?
      stmt.merge(type: :stmts, body: [stmt])
    else
      stmts.merge!(
        body: stmts[:body] << stmt,
        end: stmt[:end],
        char_end: stmt[:char_end]
      )
    end
  end

  # string_concat is a parser event that represents concatenating two
  # strings together using a backward slash, as in the following example:
  #
  #     'foo' \
  #       'bar'
  #
  def on_string_concat(left, right)
    {
      type: :string_concat,
      body: [left, right],
      start: left[:start],
      char_start: left[:char_start],
      end: right[:end],
      char_end: right[:char_end]
    }
  end

  # string_content is a parser event that represents the beginning of the
  # contents of a string, which will either be embedded inside of a
  # string_literal or a dyna_symbol node. It will have an array body so that
  # we can build up a list of @tstring_content, string_embexpr, and
  # string_dvar nodes.
  def on_string_content
    {
      type: :string,
      body: [],
      start: lineno,
      end: lineno,
      char_start: char_pos,
      char_end: char_pos
    }
  end

  # string_add is a parser event that represents a piece of a string. It
  # could be plain @tstring_content, string_embexpr, or string_dvar nodes.
  # It accepts as arguments the parent string node as well as the additional
  # piece of the string.
  def on_string_add(string, piece)
    string.merge!(
      body: string[:body] << piece,
      end: piece[:end],
      char_end: piece[:char_end]
    )
  end

  # string_dvar is a parser event that represents a very special kind of
  # interpolation into string. It allows you to take an instance variable,
  # class variable, or global variable and omit the braces when
  # interpolating. For example, if you wanted to interpolate the instance
  # variable @foo into a string, you could do "#@foo".
  def on_string_dvar(var_ref)
    find_scanner_event(:@embvar).merge!(
      type: :string_dvar,
      body: [var_ref],
      end: var_ref[:end],
      char_end: var_ref[:char_end]
    )
  end

  # string_embexpr is a parser event that represents interpolated content.
  # It can go a bunch of different parent nodes, including regexp, strings,
  # xstrings, heredocs, dyna_symbols, etc. Basically it's anywhere you see
  # the #{} construct.
  def on_string_embexpr(stmts)
    beging = find_scanner_event(:@embexpr_beg)
    ending = find_scanner_event(:@embexpr_end)

    stmts.merge!(
      char_start: beging[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :string_embexpr,
      body: [stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # String literals are either going to be a normal string or they're going
  # to be a heredoc if we've just closed a heredoc.
  def on_string_literal(string)
    heredoc = @heredocs[-1]

    if heredoc && heredoc[:ending]
      @heredocs.pop.merge!(body: string[:body])
    else
      beging = find_scanner_event(:@tstring_beg)
      ending = find_scanner_event(:@tstring_end)

      {
        type: :string_literal,
        body: string[:body],
        quote: beging[:body],
        start: beging[:start],
        char_start: beging[:char_start],
        end: ending[:end],
        char_end: ending[:char_end]
      }
    end
  end

  # A super is a parser event that represents using the super keyword with
  # any number of arguments. It can optionally use parentheses (represented
  # by an arg_paren node) or just skip straight to the arguments (with an
  # args_add_block node).
  def on_super(contents)
    find_scanner_event(:@kw, 'super').merge!(
      type: :super,
      body: [contents],
      end: contents[:end],
      char_end: contents[:char_end]
    )
  end

  # A symbol is a parser event that immediately descends from a symbol
  # literal and contains an ident representing the contents of the symbol.
  def on_symbol(ident)
    ident.merge(type: :symbol, body: [ident])
  end

  # A symbol_literal represents a symbol in the system with no interpolation
  # (as opposed to a dyna_symbol). As its only argument it accepts either a
  # symbol node (for most cases) or an ident node (in the case that we're
  # using bare words, as in an alias node like alias foo bar).
  def on_symbol_literal(contents)
    if contents[:type] == :@ident
      contents.merge(type: :symbol_literal, body: [contents])
    else
      beging = find_scanner_event(:@symbeg)
      contents.merge!(
        type: :symbol_literal,
        char_start: beging[:char_start]
      )
    end
  end

  # symbols_new is a parser event that represents the beginning of a symbol
  # literal array that accepts interpolation, like %I[one #{two} three]. It
  # can be followed by any number of symbols_add events, which we'll append
  # onto an array body.
  def on_symbols_new
    find_scanner_event(:@symbols_beg).merge!(type: :symbols, body: [])
  end

  # symbols_add is a parser event that represents an element inside of a
  # symbol literal array that accepts interpolation, like
  # %I[one #{two} three]. It accepts as arguments the parent symbols node as
  # well as a word_add parser event.
  def on_symbols_add(symbols, word_add)
    symbols.merge!(
      body: symbols[:body] << word_add,
      end: word_add[:end],
      char_end: word_add[:char_end]
    )
  end

  # A helper function to find a :: operator for the next two nodes. We do
  # special handling instead of using find_scanner_event here because we
  # don't pop off all of the :: operators so you could end up getting the
  # wrong information if you have for instance ::X::Y::Z.
  def find_colon2_before(const)
    index =
      scanner_events.rindex do |event|
        event[:type] == :@op &&
          event[:body] == '::' &&
          event[:char_start] < const[:char_start]
      end

    scanner_events[index]
  end

  # A top_const_field is a parser event that is always the child of some
  # kind of assignment. It represents when you're assigning to a constant
  # that is being referenced at the top level. For example:
  #
  #     ::X = 1
  #
  def on_top_const_field(const)
    beging = find_colon2_before(const)
    const.merge(
      type: :top_const_field,
      body: [const],
      start: beging[:start],
      char_start: beging[:char_start]
    )
  end

  # A top_const_ref is a parser event that is a very similar to
  # top_const_field except that it is not involved in an assignment. It
  # looks like the following example:
  #
  #     ::X
  #
  def on_top_const_ref(const)
    beging = find_colon2_before(const)
    const.merge(
      type: :top_const_ref,
      body: [const],
      start: beging[:start],
      char_start: beging[:char_start]
    )
  end

  # A unary node represents a unary method being called on an expression, as
  # in !, ~, or not. We have somewhat special handling of the not operator
  # since if it has parentheses they don't get reported as a paren node for
  # some reason.
  def on_unary(oper, value)
    if oper == :not
      node = find_scanner_event(:@kw, 'not')

      paren = source[node[:char_end]...value[:char_start]].include?('(')
      ending = paren ? find_scanner_event(:@rparen) : value

      node.merge!(
        type: :unary,
        oper: oper,
        body: [value],
        end: ending[:end],
        char_end: ending[:char_end],
        paren: paren
      )
    else
      find_scanner_event(:@op).merge!(
        type: :unary,
        oper: oper[0],
        body: [value],
        end: value[:end],
        char_end: value[:char_end]
      )
    end
  end

  # undef nodes represent using the keyword undef. It accepts as an argument
  # an array of symbol_literal nodes that represent each message that the
  # user is attempting to undefine. We use the keyword to get the beginning
  # location and the last symbol to get the ending.
  def on_undef(symbol_literals)
    last = symbol_literals.last

    find_scanner_event(:@kw, 'undef').merge!(
      type: :undef,
      body: symbol_literals,
      end: last[:end],
      char_end: last[:char_end]
    )
  end

  # unless is a parser event that represents the first clause in an unless
  # chain. It accepts as arguments the predicate of the unless, the
  # statements that are contained within the unless clause, and the optional
  # consequent clause.
  def on_unless(predicate, stmts, consequent)
    beging = find_scanner_event(:@kw, 'unless')
    ending = consequent || find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :unless,
      body: [predicate, stmts, consequent],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # unless_mod is a parser event that represents the modifier form of an
  # unless statement. It accepts as arguments the predicate of the unless
  # and the statement that are contained within the unless clause.
  def on_unless_mod(predicate, statement)
    find_scanner_event(:@kw, 'unless')

    {
      type: :unless_mod,
      body: [predicate, statement],
      start: statement[:start],
      char_start: statement[:char_start],
      end: predicate[:end],
      char_end: predicate[:char_end]
    }
  end

  # until is a parser event that represents an until loop. It accepts as
  # arguments the predicate to the until and the statements that are
  # contained within the until clause.
  def on_until(predicate, stmts)
    beging = find_scanner_event(:@kw, 'until')
    ending = find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :until,
      body: [predicate, stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # until_mod is a parser event that represents the modifier form of an
  # until loop. It accepts as arguments the predicate to the until and the
  # statement that is contained within the until loop.
  def on_until_mod(predicate, statement)
    find_scanner_event(:@kw, 'until')

    {
      type: :until_mod,
      body: [predicate, statement],
      start: statement[:start],
      char_start: statement[:char_start],
      end: predicate[:end],
      char_end: predicate[:char_end]
    }
  end

  # var_alias is a parser event that represents when you're using the alias
  # keyword with global variable arguments. You can optionally use
  # parentheses with this keyword, so we either track the location
  # information based on those or the final argument to the alias method.
  def on_var_alias(left, right)
    beging = find_scanner_event(:@kw, 'alias')

    paren = source[beging[:char_end]...left[:char_start]].include?('(')
    ending = paren ? find_scanner_event(:@rparen) : right

    {
      type: :var_alias,
      body: [left, right],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # var_ref is a parser event that represents using either a local variable,
  # a nil literal, a true or false literal, or a numbered block variable.
  def on_var_ref(contents)
    contents.merge(type: :var_ref, body: [contents])
  end

  # var_field is a parser event that represents a variable that is being
  # assigned a value. As such, it is always a child of an assignment type
  # node. For example, in the following example foo is a var_field:
  #
  #     foo = 1
  #
  def on_var_field(ident)
    ident.merge(type: :var_field, body: [ident])
  end

  # vcall nodes are any plain named thing with Ruby that could be either a
  # local variable or a method call. They accept as an argument the ident
  # scanner event that contains their content.
  #
  # Access controls like private, protected, and public are reported as
  # vcall nodes since they're technically method calls. We want to be able
  # add new lines around them as necessary, so here we're going to
  # explicitly track those as a different node type.
  def on_vcall(ident)
    @controls ||= %w[private protected public].freeze

    body = ident[:body]
    type =
      if @controls.include?(body) && body == lines[lineno - 1].strip
        :access_ctrl
      else
        :vcall
      end

    ident.merge(type: type, body: [ident])
  end

  def on_void_stmt
    {
      type: :void_stmt,
      start: lineno,
      end: lineno,
      char_start: char_pos,
      char_end: char_pos
    }
  end

  # when is a parser event that represents another clause in a case chain.
  # It accepts as arguments the predicate of the when, the statements that
  # are contained within the else if clause, and the optional consequent
  # clause.
  def on_when(predicate, stmts, consequent)
    beging = find_scanner_event(:@kw, 'when')
    ending = consequent || find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :when,
      body: [predicate, stmts, consequent],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # while is a parser event that represents a while loop. It accepts as
  # arguments the predicate to the while and the statements that are
  # contained within the while clause.
  def on_while(predicate, stmts)
    beging = find_scanner_event(:@kw, 'while')
    ending = find_scanner_event(:@kw, 'end')

    stmts.merge!(
      char_start: predicate[:char_end],
      char_end: ending[:char_start]
    )

    # If the only statement inside the list of statements is a void
    # statement, then just shove it to the end.
    if stmts[:body][0][:type] == :void_stmt
      stmts[:body][0].merge!(
        char_start: ending[:char_start],
        char_end: ending[:char_start]
      )
    end

    {
      type: :while,
      body: [predicate, stmts],
      start: beging[:start],
      char_start: beging[:char_start],
      end: ending[:end],
      char_end: ending[:char_end]
    }
  end

  # while_mod is a parser event that represents the modifier form of an
  # while loop. It accepts as arguments the predicate to the while and the
  # statement that is contained within the while loop.
  def on_while_mod(predicate, statement)
    find_scanner_event(:@kw, 'while')

    {
      type: :while_mod,
      body: [predicate, statement],
      start: statement[:start],
      char_start: statement[:char_start],
      end: predicate[:end],
      char_end: predicate[:char_end]
    }
  end

  # word_new is a parser event that represents the beginning of a word
  # within a special array literal (either strings or symbols) that accepts
  # interpolation. For example, in the following array, there are three
  # word nodes:
  #
  #     %W[one a#{two}a three]
  #
  # Each word inside that array is represented as its own node, which is in
  # terms of the parser a tree of word_new and word_add nodes. For our
  # purposes, we're going to report this as a word node and build up an
  # array body of our parts.
  def on_word_new
    { type: :word, body: [] }
  end

  # word_add is a parser event that represents a piece of a word within a
  # special array literal that accepts interpolation. It accepts as
  # arguments the parent word node as well as the additional piece of the
  # word, which can be either a @tstring_content node for a plain string
  # piece or a string_embexpr for an interpolated piece.
  def on_word_add(word, piece)
    if word[:body].empty?
      # Here we're making sure we get the correct bounds by using the
      # location information from the first piece.
      piece.merge(type: :word, body: [piece])
    else
      word.merge!(
        body: word[:body] << piece,
        end: piece[:end],
        char_end: piece[:char_end]
      )
    end
  end

  # words_new is a parser event that represents the beginning of a string
  # literal array that accepts interpolation, like %W[one #{two} three]. It
  # can be followed by any number of words_add events, which we'll append
  # onto an array body.
  def on_words_new
    find_scanner_event(:@words_beg).merge!(type: :words, body: [])
  end

  # words_add is a parser event that represents an element inside of a
  # string literal array that accepts interpolation, like
  # %W[one #{two} three]. It accepts as arguments the parent words node as
  # well as a word_add parser event.
  def on_words_add(words, word_add)
    words.merge!(
      body: words[:body] << word_add,
      end: word_add[:end],
      char_end: word_add[:char_end]
    )
  end

  # xstring_new is a parser event that represents the beginning of a string
  # of commands that gets sent out to the terminal, like `ls`. It can
  # optionally include interpolation much like a regular string, so we're
  # going to build up an array body.
  #
  # If the xstring actually starts with a heredoc declaration, then we're
  # going to let heredocs continue to do their thing and instead just use
  # its location information.
  def on_xstring_new
    heredoc = @heredocs[-1]

    if heredoc && heredoc[:beging][3] = '`'
      heredoc.merge(type: :xstring, body: [])
    else
      find_scanner_event(:@backtick).merge!(type: :xstring, body: [])
    end
  end

  # xstring_add is a parser event that represents a piece of a string of
  # commands that gets sent out to the terminal, like `ls`. It accepts two
  # arguments, the parent xstring node as well as the piece that is being
  # added to the string. Because it supports interpolation this is either a
  # tstring_content scanner event representing bare string content or a
  # string_embexpr representing interpolated content.
  def on_xstring_add(xstring, piece)
    xstring.merge!(
      body: xstring[:body] << piece,
      end: piece[:end],
      char_end: piece[:char_end]
    )
  end

  # xstring_literal is a parser event that represents a string of commands
  # that gets sent to the terminal, like `ls`. It accepts as its only
  # argument an xstring node that is a built up array representation of all
  # of the parts of the string (including the plain string content and the
  # interpolated content).
  #
  # They can also use heredocs to present themselves, as in the example:
  #
  #     <<-`SHELL`
  #       ls
  #     SHELL
  #
  # In this case we need to change the node type to be a heredoc instead of
  # an xstring_literal in order to get the right formatting.
  def on_xstring_literal(xstring)
    heredoc = @heredocs[-1]

    if heredoc && heredoc[:beging][3] = '`'
      heredoc.merge!(body: xstring[:body])
    else
      ending = find_scanner_event(:@tstring_end)
      xstring.merge!(
        type: :xstring_literal,
        end: ending[:end],
        char_end: ending[:char_end]
      )
    end
  end

  # yield is a parser event that represents using the yield keyword with
  # arguments. It accepts as an argument an args_add_block event that
  # contains all of the arguments being passed.
  def on_yield(args_add_block)
    find_scanner_event(:@kw, 'yield').merge!(
      type: :yield,
      body: [args_add_block],
      end: args_add_block[:end],
      char_end: args_add_block[:char_end]
    )
  end

  # yield0 is a parser event that represents the bare yield keyword. It has
  # no body as it accepts no arguments. This is as opposed to the yield
  # parser event, which is the version where you're yielding one or more
  # values.
  def on_yield0
    find_scanner_event(:@kw, 'yield').merge!(type: :yield0)
  end

  # zsuper is a parser event that represents the bare super keyword. It has
  # no body as it accepts no arguments. This is as opposed to the super
  # parser event, which is the version where you're calling super with one
  # or more values.
  def on_zsuper
    find_scanner_event(:@kw, 'super').merge!(type: :zsuper)
  end

  def on_rescue(*body)
    min = body.map { |part| part.is_a?(Hash) ? part[:start] : lineno }.min
    children = body.length == 1 && body[0].is_a?(Array) ? body[0] : body
    char_starts =
      children.map { |part| part[:char_start] if part.is_a?(Hash) }.compact

    {
      type: :rescue,
      body: body,
      start: min || lineno,
      end: lineno,
      char_start: char_starts.min || char_pos,
      char_end: char_pos
    }
  end
end

# If this is the main file we're executing, then most likely this is being
# executed from the parser.js spawn. In that case, read the ruby source from
# stdin and report back the AST over stdout.

if $0 == __FILE__
  builder = Prettier::Parser.new($stdin.read)
  response = builder.parse

  if !response || builder.error?
    warn(
      '@prettier/plugin-ruby encountered an error when attempting to parse ' \
        'the ruby source. This usually means there was a syntax error in the ' \
        'file in question. You can verify by running `ruby -i [path/to/file]`.'
    )

    exit 1
  end

  puts JSON.fast_generate(response)
end
