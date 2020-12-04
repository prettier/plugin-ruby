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

      %i[args mlhs mrhs regexp stmts string xstring].each do |event|
        suffix = event == :string ? 'content' : 'new'

        define_method(:"on_#{event}_#{suffix}") do
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
        defined: [:@kw, 'defined?'],
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
        regexp_literal: :@regexp_beg,
        rescue: [:@kw, 'rescue'],
        rest_param: [:@op, '*'],
        return: [:@kw, 'return'],
        sclass: [:@kw, 'class'],
        string_dvar: :@embvar,
        string_embexpr: :@embexpr_beg,
        top_const_field: [:@op, '::'],
        top_const_ref: [:@op, '::'],
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

      # This is mostly identical to the method that is dynamically defined for
      # all `events` (above), except that `char_pos` was causing problems
      # because it was factoring comments into the char pos, so we replaced it
      # with `char_end_for(body)`
      def on_undef(*body)
        node = find_scanner_event(:@kw, 'undef')

        super(*body).merge!(
          start: node[:start],
          char_start: node[:char_start],
          char_end: char_end_for(body)
        )
      end

      # Array nodes can contain a myriad of subnodes because of the special
      # array literal syntax like %w and %i. As a result, we may be looking for
      # an left bracket, or we may be just looking at the children.
      def on_array(*body)
        if body[0] && %i[args args_add_star].include?(body[0][:type])
          node = find_scanner_event(:@lbracket)

          super(*body).merge!(
            start: node[:start],
            char_start: node[:char_start],
            char_end: char_pos
          )
        else
          super(*body).merge!(
            char_start: char_start_for(body), char_end: char_pos
          )
        end
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

      # String literals and either contain string parts or a heredoc. If it
      # contains a heredoc we can just go directly to the child nodes, otherwise
      # we need to look for a `tstring_beg`.
      def on_string_literal(*body)
        if body[0][:type] == :heredoc
          super(*body).merge!(
            char_start: char_start_for(body), char_end: char_pos
          )
        else
          node = find_scanner_event(:@tstring_beg)

          super(*body).merge!(
            start: node[:start],
            char_start: node[:char_start],
            char_end: char_pos,
            quote: node[:body]
          )
        end
      end

      # Technically, the `not` operator is a unary operator but is reported as
      # a keyword and not an operator. Because of the inconsistency, we have to
      # manually look for the correct scanner event here.
      def on_unary(*body)
        node =
          if body[0] == :not
            find_scanner_event(:@kw, 'not')
          else
            find_scanner_event(:@op)
          end

        super(*body).merge!(
          start: node[:start],
          char_start: node[:char_start],
          char_end: char_pos,
          paren: source[node[:char_end]...body[1][:char_start]].include?('(')
        )
      end

      # xstring_literal nodes can actually use heredocs to present themselves,
      # as in the example:
      #
      # <<-`SHELL`
      #   ls
      # SHELL
      #
      # In this case we need to change the node type to be a heredoc instead of
      # an xstring_literal in order to get the right formatting.
      def on_xstring_literal(*body)
        heredoc = @heredocs[-1]

        if heredoc && heredoc[:beging][3] = '`'
          heredoc.merge!(body[0].slice(:body))
        else
          node = find_scanner_event(:@backtick)

          super(*body).merge!(
            start: node[:start],
            char_start: node[:char_start],
            char_end: char_pos
          )
        end
      end

      # Symbols don't necessarily have to have a @symbeg event fired before they
      # start. For example, you can have symbol literals inside an `alias` node
      # if you're just using bare words, as in: `alias foo bar`. So this is a
      # special case in which if there is a `:@symbeg` event we can hook on to
      # then we use it, otherwise we just look at the beginning of the first
      # child node.
      %i[dyna_symbol symbol_literal].each do |event|
        define_method(:"on_#{event}") do |*body|
          options =
            if scanner_events.any? { |sevent| sevent[:type] == :@symbeg }
              symbeg = find_scanner_event(:@symbeg)

              {
                char_start: symbeg[:char_start],
                char_end: char_pos,
                quote: symbeg[:body][1]
              }
            elsif scanner_events.any? { |sevent| sevent[:type] == :@label_end }
              label_end = find_scanner_event(:@label_end)

              {
                char_start: char_start_for(body),
                char_end: char_pos,
                quote: label_end[:body][0]
              }
            else
              { char_start: char_start_for(body), char_end: char_pos }
            end

          super(*body).merge!(options)
        end
      end

      def on_program(*body)
        super(*body).merge!(start: 1, char_start: 0, char_end: char_pos)
      end

      def on_vcall(*body)
        super(*body).merge!(
          char_start: char_start_for(body), char_end: char_end_for(body)
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
      def on_program(*body)
        super(*body).merge!(comments: @comments).tap do |node|
          node[:body][0][:body] << @__end__ if @__end__
        end
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

      # String literals are either going to be a normal string or they're going
      # to be a heredoc if we've just closed a heredoc.
      def on_string_literal(string)
        heredoc = @heredocs[-1]

        if heredoc && heredoc[:ending]
          @heredocs.pop.merge!(string.slice(:body))
        else
          super
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

      # Like comments, we need to force the encoding here so JSON doesn't break.
      def on_tstring_content(value)
        super(value.force_encoding('UTF-8'))
      end

      # Normally access controls are reported as vcall nodes. This creates a
      # new node type to explicitly track those nodes instead, so that the
      # printer can add new lines as necessary.
      def on_vcall(ident)
        @access_controls ||= %w[private protected public].freeze

        super(ident).tap do |node|
          if !@access_controls.include?(ident[:body]) ||
               ident[:body] != lines[lineno - 1].strip
            next
          end

          node.merge!(type: :access_ctrl)
        end
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
