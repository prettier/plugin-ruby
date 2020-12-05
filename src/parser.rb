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

  # Parser events represent nodes in the ripper abstract syntax tree. The event
  # is reported after the children of the node have already been built.
  PARSER_EVENTS.each do |event|
    define_method(:"on_#{event}") do |*body|
      min = body.map { |part| part.is_a?(Hash) ? part[:start] : lineno }.min
      { type: event, body: body, start: min || lineno, end: lineno }
    end
  end

  # Some nodes are lists that come back from the parser. They always start with
  # a `*_new` node (or in the case of string, `*_content`) and each additional
  # node in the list is a `*_add` node. This module takes those nodes and turns
  # them into one node with an array body.
  #
  # For example, the statement `[a, b, c]` would be parsed as:
  #
  # [:args_add,
  #   [:args_add,
  #     [:args_add,
  #       [:args_new],
  #       [:vcall, [:@ident, "a", [1, 1]]]
  #     ],
  #     [:vcall, [:@ident, "b", [1, 4]]]
  #   ],
  #   [:vcall, [:@ident, "c", [1, 7]]]
  # ]
  #
  # But after this module is applied that is instead parsed as:
  #
  # [:args,
  #   [
  #     [:vcall, [:@ident, "a", [1, 1]]],
  #     [:vcall, [:@ident, "b", [1, 4]]],
  #     [:vcall, [:@ident, "c", [1, 7]]]
  #   ]
  # ]
  #
  # This makes it a lot easier to join things with commas, and ends up resulting
  # in a much flatter `prettier` tree once it has been converted. Note that
  # because of this module some extra node types are added (the aggregate of
  # the previous `*_add` nodes) and some nodes now have arrays in places where
  # they previously had single nodes.
  prepend(
    Module.new do
      private

      %i[args mlhs mrhs stmts].each do |event|
        define_method(:"on_#{event}_new") do
          { type: event, body: [], start: lineno, end: lineno }
        end

        define_method(:"on_#{event}_add") do |parts, part|
          parts.tap do |node|
            node[:body] << part
            node[:end] = lineno
          end
        end
      end
    end
  )

  # For each node, we need to attach where it came from in order to be able to
  # support placing the cursor correctly before and after formatting.
  #
  # For most nodes, it's enough to look at the child nodes to determine the
  # start of the parent node. However, for some nodes it's necessary to keep
  # track of the keywords as they come in from the lexer and to modify the start
  # node once we have it.
  prepend(
    Module.new do
      private

      def char_start_for(body)
        children = body.length == 1 && body[0].is_a?(Array) ? body[0] : body
        char_starts =
          children.map { |part| part[:char_start] if part.is_a?(Hash) }.compact

        char_starts.min || char_pos
      end

      def char_end_for(body)
        children = body.length == 1 && body[0].is_a?(Array) ? body[0] : body
        char_ends =
          children.map { |part| part[:char_end] if part.is_a?(Hash) }.compact

        char_ends.max || char_pos
      end

      events = {
        BEGIN: [:@kw, 'BEGIN'],
        END: [:@kw, 'END'],
        alias: [:@kw, 'alias'],
        assoc_splat: [:@op, '**'],
        arg_paren: :@lparen,
        args_add_star: [:@op, '*'],
        args_forward: [:@op, '...'],
        begin: [:@kw, 'begin'],
        blockarg: [:@op, '&'],
        brace_block: :@lbrace,
        break: [:@kw, 'break'],
        case: [:@kw, 'case'],
        class: [:@kw, 'class'],
        def: [:@kw, 'def'],
        defs: [:@kw, 'def'],
        do_block: [:@kw, 'do'],
        else: [:@kw, 'else'],
        elsif: [:@kw, 'elsif'],
        ensure: [:@kw, 'ensure'],
        for: [:@kw, 'for'],
        hash: :@lbrace,
        if: [:@kw, 'if'],
        in: [:@kw, 'in'],
        kwrest_param: [:@op, '**'],
        lambda: :@tlambda,
        mlhs_paren: :@lparen,
        mrhs_add_star: [:@op, '*'],
        module: [:@kw, 'module'],
        next: [:@kw, 'next'],
        paren: :@lparen,
        rescue: [:@kw, 'rescue'],
        rest_param: [:@op, '*'],
        return: [:@kw, 'return'],
        sclass: [:@kw, 'class'],
        unless: [:@kw, 'unless'],
        until: [:@kw, 'until'],
        var_alias: [:@kw, 'alias'],
        when: [:@kw, 'when'],
        while: [:@kw, 'while'],
        yield: [:@kw, 'yield']
      }

      events.each do |event, (type, scanned)|
        define_method(:"on_#{event}") do |*body|
          node = find_scanner_event(type, scanned || :any)

          super(*body).merge!(
            start: node[:start],
            char_start: node[:char_start],
            char_end: char_pos
          )
        end
      end

      def on_super(*body)
        node = find_scanner_event(:@kw, 'super')

        super(*body).merge!(
          start: node[:start],
          char_start: node[:char_start],
          char_end: char_end_for(body)
        )
      end

      # Array pattern nodes contain an odd mix of potential child nodes based on
      # which kind of pattern is being used.
      def on_aryptn(*body)
        char_start, char_end = char_pos, char_pos

        body.flatten(1).each do |part|
          next unless part

          char_start = [char_start, part[:char_start]].min
          char_end = [char_end, part[:char_end]].max
        end

        super(*body).merge!(char_start: char_start, char_end: char_end)
      end

      # Params have a somewhat interesting structure in that they are an array
      # of arrays where the position in the top-level array indicates the type
      # of param and the subarray is the list of parameters of that type. We
      # therefore have to flatten them down to get to the location.
      def on_params(*body)
        super(*body).merge!(
          char_start: char_start_for(body.flatten(1)), char_end: char_pos
        )
      end

      defined = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }

      (PARSER_EVENTS - defined).each do |event|
        define_method(:"on_#{event}") do |*body|
          super(*body).merge!(
            char_start: char_start_for(body), char_end: char_pos
          )
        end
      end
    end
  )

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

      # When the only statement inside of a `def` node is a `begin` node, then
      # you can safely replace the body of the `def` with the body of the
      # `begin`. For example:
      #
      # def foo
      #   begin
      #     try_something
      #   rescue SomeError => error
      #     handle_error(error)
      #   end
      # end
      #
      # can get transformed into:
      #
      # def foo
      #   try_something
      # rescue SomeError => error
      #   handle_error(error)
      # end
      #
      # This module handles this by hoisting up the `bodystmt` node from the
      # inner `begin` up to the `def`.
      def on_def(ident, params, bodystmt)
        def_bodystmt = bodystmt
        stmts, *other_parts = bodystmt[:body]

        if !other_parts.any? && stmts[:body].length == 1 &&
             stmts.dig(:body, 0, :type) == :begin
          def_bodystmt = stmts.dig(:body, 0, :body, 0)
        end

        super(ident, params, def_bodystmt)
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

      def on_excessed_comma
        find_scanner_event(:@comma).merge!(type: :excessed_comma)
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

      # Like comments, we need to force the encoding here so JSON doesn't break.
      def on_ident(value)
        super(value.force_encoding('UTF-8'))
      end

      # We need to track for `massign` and `mlhs_paren` nodes whether or not
      # there was an extra comma at the end of the expression. For some reason
      # it's not showing up in the AST in an obvious way. In this case we're
      # just simplifying everything by adding an additional field to `mlhs`
      # nodes called `comma` that indicates whether or not there was an extra.
      def on_massign(left, right)
        super.tap do
          next unless left[:type] == :mlhs

          range = left[:char_start]..left[:char_end]
          left[:comma] = source[range].strip.end_with?(',')
        end
      end

      def on_mlhs_paren(body)
        super.tap do |node|
          next unless body[:type] == :mlhs

          ending = source.rindex(')', char_pos)
          buffer = source[(node[:char_start] + 1)...ending]

          body[:comma] = buffer.strip.end_with?(',')
        end
      end

      # The program node is the very top of the AST. Here we'll attach all of
      # the comments that we've gathered up over the course of parsing the
      # source string. We'll also attach on the __END__ content if there was
      # some found at the end of the source string.
      def on_program(statements)
        statements[:body] << @__end__ if @__end__

        {
          type: :program,
          body: [statements],
          start: 1,
          end: lines.length,
          char_start: 0,
          char_end: source.length,
          comments: @comments
        }
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

      # retry is a parser event that represents the bare retry keyword. It has
      # no body as it accepts no arguments.
      def on_retry
        find_scanner_event(:@kw, 'retry').merge!(type: :retry)
      end

      # return0 is a parser event that represents the bare return keyword. It
      # has no body as it accepts no arguments. This is as opposed to the return
      # parser event, which is the version where you're returning one or more
      # values.
      def on_return0
        find_scanner_event(:@kw, 'return').merge!(type: :return0)
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
      def on_string_embexpr(statements)
        beging = find_scanner_event(:@embexpr_beg)
        ending = find_scanner_event(:@embexpr_end)

        statements.merge!(
          char_start: beging[:char_end],
          char_end: ending[:char_start]
        )

        {
          type: :string_embexpr,
          body: [statements],
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

      # Like comments, we need to force the encoding here so JSON doesn't break.
      def on_tstring_content(value)
        super(value.force_encoding('UTF-8'))
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
    end
  )
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
