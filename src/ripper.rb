#!/usr/bin/env ruby

# We implement our own version checking here instead of using Gem::Version so
# that we can use the --disable-gems flag.
major, minor, * = RUBY_VERSION.split('.').map(&:to_i)
if (major < 2) || ((major == 2) && (minor < 5))
  warn(
    "Ruby version #{current_version} not supported. " \
      "Please upgrade to #{required_version} or above."
  )

  exit 1
end

require 'json' unless defined?(JSON)
require 'ripper'

class RipperJS < Ripper
  attr_reader :source, :lines, :__end__

  def initialize(source, *args)
    super(source, *args)

    @source = source
    @lines = source.split("\n")
    @__end__ = nil
  end

  private

  # Scanner events occur when the lexer hits a new token, like a keyword or an
  # end. These nodes always contain just one argument which is a string
  # representing the content. For the most part these can just be printed
  # directly, which very few exceptions.
  SCANNER_EVENTS.each do |event|
    define_method(:"on_#{event}") do |body|
      { type: :"@#{event}", body: body, start: lineno, end: lineno }
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
      events = %i[
        args
        mlhs
        mrhs
        qsymbols
        qwords
        regexp
        stmts
        string
        symbols
        words
        xstring
      ]

      private

      events.each do |event|
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
      def initialize(source, *args)
        super(source, *args)

        @scanner_events = []
        @line_counts = [0]

        source.lines.each { |line| line_counts << line_counts.last + line.size }
      end

      def self.prepended(base)
        base.attr_reader :scanner_events, :line_counts
      end

      private

      def char_pos
        line_counts[lineno - 1] + column
      end

      def char_start_for(body)
        children = body.length == 1 && body[0].is_a?(Array) ? body[0] : body
        char_starts =
          children.map { |part| part[:char_start] if part.is_a?(Hash) }.compact

        char_starts.min || char_pos
      end

      def find_scanner_event(type, body = :any)
        index =
          scanner_events.rindex do |scanner_event|
            scanner_event[:type] == type &&
              (body == :any || (scanner_event[:body] == body))
          end

        scanner_events.delete_at(index)
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
        excessed_comma: :@comma,
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
        qsymbols_new: :@qsymbols_beg,
        qwords_new: :@qwords_beg,
        redo: [:@kw, 'redo'],
        regexp_literal: :@regexp_beg,
        rescue: [:@kw, 'rescue'],
        rest_param: [:@op, '*'],
        retry: [:@kw, 'retry'],
        return0: [:@kw, 'return'],
        return: [:@kw, 'return'],
        sclass: [:@kw, 'class'],
        string_dvar: :@embvar,
        string_embexpr: :@embexpr_beg,
        super: [:@kw, 'super'],
        symbols_new: :@symbols_beg,
        top_const_field: [:@op, '::'],
        top_const_ref: [:@op, '::'],
        undef: [:@kw, 'undef'],
        unless: [:@kw, 'unless'],
        until: [:@kw, 'until'],
        var_alias: [:@kw, 'alias'],
        when: [:@kw, 'when'],
        while: [:@kw, 'while'],
        words_new: :@words_beg,
        xstring_literal: :@backtick,
        yield0: [:@kw, 'yield'],
        yield: [:@kw, 'yield'],
        zsuper: [:@kw, 'super']
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
          start: node[:start], char_start: node[:char_start], char_end: char_pos
        )
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

      defined =
        private_instance_methods(false).grep(/\Aon_/) { $'.to_sym } +
          %i[embdoc embdoc_beg embdoc_end heredoc_beg heredoc_end]

      (SCANNER_EVENTS - defined).each do |event|
        define_method(:"on_#{event}") do |body|
          super(body).tap do |node|
            char_end = char_pos + (body ? body.size : 0)
            node.merge!(char_start: char_pos, char_end: char_end)

            scanner_events << node
          end
        end
      end

      (PARSER_EVENTS - defined).each do |event|
        define_method(:"on_#{event}") do |*body|
          super(*body).merge!(
            char_start: char_start_for(body), char_end: char_pos
          )
        end
      end
    end
  )

  # This layer keeps track of inline comments as they come in. Ripper itself
  # doesn't attach comments to the AST, so we need to do it manually. In this
  # case, inline comments are defined as any comments wherein the lexer state is
  # not equal to EXPR_BEG (tracked in the BlockComments layer).
  prepend(
    Module.new do
      # Certain events needs to steal the comments from their children in order
      # for them to display properly.
      events = {
        aref: [:body, 1],
        args_add_block: [:body, 0],
        break: [:body, 0],
        call: [:body, 0],
        command: [:body, 1],
        command_call: [:body, 3],
        regexp_literal: [:body, 0],
        string_literal: [:body, 0],
        symbol_literal: [:body, 0]
      }

      def initialize(*args)
        super(*args)
        @inline_comments = []
        @last_sexp = nil
      end

      def self.prepended(base)
        base.attr_reader :inline_comments, :last_sexp
      end

      private

      events.each do |event, path|
        define_method(:"on_#{event}") do |*body|
          @last_sexp =
            super(*body).tap do |sexp|
              comments = (sexp.dig(*path) || {}).delete(:comments)
              sexp.merge!(comments: comments) if comments
            end
        end
      end

      SPECIAL_LITERALS = %i[qsymbols qwords symbols words].freeze

      # Special array literals are handled in different ways and so their
      # comments need to be passed up to their parent array node.
      def on_array(*body)
        @last_sexp =
          super(*body).tap do |sexp|
            next unless SPECIAL_LITERALS.include?(body.dig(0, :type))

            comments = sexp.dig(:body, 0).delete(:comments)
            sexp.merge!(comments: comments) if comments
          end
      end

      # Handling this specially because we want to pull the comments out of both
      # child nodes.
      def on_assoc_new(*body)
        @last_sexp =
          super(*body).tap do |sexp|
            comments =
              (sexp.dig(:body, 0).delete(:comments) || []) +
                (sexp.dig(:body, 1).delete(:comments) || [])

            sexp.merge!(comments: comments) if comments.any?
          end
      end

      # Most scanner events don't stand on their own as s-expressions, but the
      # CHAR scanner event is effectively just a string, so we need to track it
      # as a s-expression.
      def on_CHAR(body)
        @last_sexp = super(body)
      end

      # We need to know exactly where the comment is, switching off the current
      # lexer state. In Ruby 2.7.0-dev, that's defined as:
      #
      # enum lex_state_bits {
      #     EXPR_BEG_bit,     /* ignore newline, +/- is a sign. */
      #     EXPR_END_bit,     /* newline significant, +/- is an operator. */
      #     EXPR_ENDARG_bit,  /* ditto, and unbound braces. */
      #     EXPR_ENDFN_bit,   /* ditto, and unbound braces. */
      #     EXPR_ARG_bit,     /* newline significant, +/- is an operator. */
      #     EXPR_CMDARG_bit,  /* newline significant, +/- is an operator. */
      #     EXPR_MID_bit,     /* newline significant, +/- is an operator. */
      #     EXPR_FNAME_bit,   /* ignore newline, no reserved words. */
      #     EXPR_DOT_bit,     /* right after `.' or `::', no reserved words. */
      #     EXPR_CLASS_bit,   /* immediate after `class', no here document. */
      #     EXPR_LABEL_bit,   /* flag bit, label is allowed. */
      #     EXPR_LABELED_bit, /* flag bit, just after a label. */
      #     EXPR_FITEM_bit,   /* symbol literal as FNAME. */
      #     EXPR_MAX_STATE
      # };
      def on_comment(body)
        sexp = { type: :@comment, body: body.chomp, start: lineno, end: lineno }

        case RipperJS.lex_state_name(state).gsub('EXPR_', '')
        when 'END', 'ARG|LABELED', 'ENDFN'
          last_sexp.merge!(comments: [sexp])
        when 'CMDARG', 'END|ENDARG', 'ENDARG', 'ARG', 'FNAME|FITEM', 'CLASS',
             'END|LABEL'
          inline_comments << sexp
        when 'BEG|LABEL', 'MID'
          inline_comments << sexp.merge!(break: true)
        when 'DOT'
          last_sexp.merge!(comments: [sexp.merge!(break: true)])
        end

        sexp
      end

      defined = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }

      (PARSER_EVENTS - defined).each do |event|
        define_method(:"on_#{event}") do |*body|
          super(*body).tap do |sexp|
            @last_sexp = sexp
            next if inline_comments.empty?

            sexp[:comments] = inline_comments.reverse
            @inline_comments = []
          end
        end
      end
    end
  )

  # Nodes that are always on their own line occur when the lexer is in the
  # EXPR_BEG state. Those comments are tracked within the @block_comments
  # instance variable. Then for each node that could contain them, we attach
  # them after the node has been built.
  prepend(
    Module.new do
      events = {
        begin: [0, :body, 0],
        bodystmt: [0],
        class: [2, :body, 0],
        def: [2, :body, 0],
        defs: [4, :body, 0],
        else: [0],
        elsif: [1],
        ensure: [0],
        if: [1],
        program: [0],
        rescue: [2],
        sclass: [1, :body, 0],
        unless: [1],
        until: [1],
        when: [1],
        while: [1]
      }

      def initialize(*args)
        super(*args)
        @block_comments = []
        @current_embdoc = nil
      end

      def self.prepended(base)
        base.attr_reader :block_comments, :current_embdoc
      end

      private

      def attach_comments(sexp, stmts)
        range = sexp[:start]..sexp[:end]
        comments =
          block_comments.group_by { |comment| range.include?(comment[:start]) }

        if comments[true]
          stmts[:body] =
            (stmts[:body] + comments[true]).sort_by { |node| node[:start] }

          @block_comments = comments.fetch(false) { [] }
        end
      end

      events.each do |event, path|
        define_method(:"on_#{event}") do |*body|
          super(*body).tap { |sexp| attach_comments(sexp, body.dig(*path)) }
        end
      end

      def on_comment(body)
        super(body).tap do |sexp|
          lex_state = RipperJS.lex_state_name(state).gsub('EXPR_', '')
          block_comments << sexp if lex_state == 'BEG'
        end
      end

      def on_embdoc_beg(comment)
        @current_embdoc = {
          type: :embdoc, body: comment, start: lineno, end: lineno
        }
      end

      def on_embdoc(comment)
        @current_embdoc[:body] << comment
      end

      def on_embdoc_end(comment)
        @current_embdoc[:body] << comment.chomp
        @block_comments << @current_embdoc
        @current_embdoc = nil
      end

      def on_method_add_block(*body)
        super(*body).tap do |sexp|
          stmts = body[1][:body][1]
          stmts = stmts[:type] == :stmts ? stmts : body[1][:body][1][:body][0]

          attach_comments(sexp, stmts)
        end
      end
    end
  )

  # Tracking heredocs in somewhat interesting. Straight-line heredocs are
  # reported as strings, whereas squiggly-line heredocs are reported as
  # heredocs. We track the start and matching end of the heredoc as "beging" and
  # "ending" respectively.
  prepend(
    Module.new do
      def initialize(*args)
        super(*args)
        @heredoc_stack = []
      end

      def self.prepended(base)
        base.attr_reader :heredoc_stack
      end

      private

      def on_embexpr_beg(body)
        super(body).tap { |sexp| heredoc_stack << sexp }
      end

      def on_embexpr_end(body)
        super(body).tap { heredoc_stack.pop }
      end

      def on_heredoc_beg(beging)
        heredoc = { type: :heredoc, beging: beging, start: lineno, end: lineno }
        heredoc_stack << heredoc
      end

      def on_heredoc_end(ending)
        heredoc_stack[-1].merge!(ending: ending.chomp, end: lineno)
      end

      def on_heredoc_dedent(string, _width)
        heredoc = heredoc_stack.pop
        string.merge!(heredoc.slice(:type, :beging, :ending, :start, :end))
      end

      def on_string_literal(string)
        heredoc = heredoc_stack[-1]

        if heredoc && string[:type] != :heredoc && heredoc[:type] == :heredoc
          heredoc_stack.pop
          string.merge!(heredoc.slice(:type, :beging, :ending, :start, :end))
        else
          super
        end
      end
    end
  )

  # This module contains miscellaneous fixes required to get the right
  # structure.
  prepend(
    Module.new do
      private

      # These are the event types that contain _actual_ string content. If
      # there is an encoding magic comment at the top of the file, ripper will
      # actually change into that encoding for the storage of the string. This
      # will break everything, so we need to force the encoding back into UTF-8
      # so that the JSON library won't break.
      %w[comment ident tstring_content].each do |event|
        define_method(:"on_#{event}") do |body|
          super(body.force_encoding('UTF-8'))
        end
      end

      # Handles __END__ syntax, which allows individual scripts to keep content
      # after the main ruby code that can be read through DATA. It looks like:
      #
      # foo.bar
      #
      # __END__
      # some other content that isn't normally read by ripper
      def on___end__(body)
        @__end__ = super(lines[lineno..-1].join("\n"))
      end

      def on_program(*body)
        super(*body).tap { |node| node[:body][0][:body] << __end__ if __end__ }
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

      # By default, Ripper parses the expression `lambda { foo }` as a
      # `method_add_block` node, so we can't turn it back into `-> { foo }`.
      # This module overrides that behavior and reports it back as a `lambda`
      # node instead.
      def on_method_add_block(invocation, block)
        # It's possible to hit a `method_add_block` node without going through
        # `method_add_arg` node, ex: `super {}`. In that case we're definitely
        # not going to transform into a lambda.
        return super if invocation[:type] != :method_add_arg

        fcall, args = invocation[:body]

        # If there are arguments to the `lambda`, that means `lambda` has been
        # overridden as a function so we cannot transform it into a `lambda`
        # node.
        if fcall[:type] != :fcall || args[:type] != :args || args[:body].any?
          return super
        end

        ident = fcall.dig(:body, 0)
        return super if ident[:type] != :@ident || ident[:body] != 'lambda'

        super.tap do |sexp|
          params, stmts = block[:body]
          params ||= { type: :params, body: [] }

          sexp.merge!(type: :lambda, body: [params, stmts])
        end
      end

      # We need to track for `mlhs_paren` and `massign` nodes whether or not
      # there was an extra comma at the end of the expression. For some reason
      # it's not showing up in the AST in an obvious way. In this case we're
      # just simplifying everything by adding an additional field to `mlhs`
      # nodes called `comma` that indicates whether or not there was an extra.
      def on_mlhs_paren(body)
        super.tap do |node|
          next unless body[:type] == :mlhs

          ending = source.rindex(')', char_pos)
          buffer = source[(node[:char_start] + 1)...ending]

          body[:comma] = buffer.strip.end_with?(',')
        end
      end

      def on_massign(left, right)
        super.tap do
          next unless left[:type] == :mlhs

          range = left[:char_start]..left[:char_end]
          left[:comma] = source[range].strip.end_with?(',')
        end
      end
    end
  )
end

# If this is the main file we're executing, then most likely this is being
# executed from the parse.js spawn. In that case, read the ruby source from
# stdin and report back the AST over stdout.

if $0 == __FILE__
  builder = RipperJS.new($stdin.read)
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
