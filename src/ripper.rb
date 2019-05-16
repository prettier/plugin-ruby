#!/usr/bin/env ruby

REQUIRED_VERSION = Gem::Version.new('2.5')
if Gem::Version.new(RUBY_VERSION) < REQUIRED_VERSION
  raise "Ruby version #{RUBY_VERSION} not supported. " \
          "Please upgrade to #{REQUIRED_VERSION} or above."
end

require 'json' unless defined?(JSON)
require 'ripper'

class RipperJS < Ripper
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

  # For most nodes, it's enough to look at the child nodes to determine the
  # start of the parent node. However, for some nodes it's necessary to keep
  # track of the keywords as they come in from the lexer and to modify the start
  # node once we have it. We need accurate start and end lines so that we can
  # embed block comments into the right kind of node.
  prepend(
    Module.new do
      events = %i[begin else elsif ensure if rescue until while]

      def initialize(*args)
        super(*args)
        @keywords = []
      end

      def self.prepended(base)
        base.attr_reader :keywords
      end

      private

      def find_start(body)
        keywords[keywords.rindex { |keyword| keyword[:body] == body }][:start]
      end

      events.each do |event|
        keyword = event.to_s

        define_method(:"on_#{event}") do |*body|
          super(*body).tap { |sexp| sexp.merge!(start: find_start(keyword)) }
        end
      end

      def on_kw(body)
        super(body).tap { |sexp| keywords << sexp }
      end

      def on_program(*body)
        super(*body).tap { |sexp| sexp.merge!(start: 1) }
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

        case RipperJS.lex_state_name(state)
        when 'EXPR_END', 'EXPR_ARG|EXPR_LABELED', 'EXPR_ENDFN'
          last_sexp.merge!(comments: [sexp])
        when 'EXPR_CMDARG', 'EXPR_END|EXPR_ENDARG', 'EXPR_ENDARG', 'EXPR_ARG',
             'EXPR_FNAME|EXPR_FITEM', 'EXPR_CLASS', 'EXPR_END|EXPR_LABEL'
          inline_comments << sexp
        when 'EXPR_BEG|EXPR_LABEL', 'EXPR_MID'
          inline_comments << sexp.merge!(break: true)
        when 'EXPR_DOT'
          last_sexp.merge!(comments: [sexp.merge!(break: true)])
        end

        sexp
      end

      defined = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }

      (Ripper::PARSER_EVENTS - defined).each do |event|
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
          block_comments << sexp if RipperJS.lex_state_name(state) == 'EXPR_BEG'
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

  # These are the event types that contain _actual_ string content. If there is
  # an encoding magic comment at the top of the file, ripper will actually
  # change into that encoding for the storage of the string. This will break
  # everything, so we need to force the encoding back into UTF-8 so that
  # the JSON library won't break.
  prepend(
    Module.new do
      private

      %w[comment ident tstring_content].each do |event|
        define_method(:"on_#{event}") do |body|
          super(body.force_encoding('UTF-8'))
        end
      end
    end
  )

  # Handles __END__ syntax, which allows individual scripts to keep content
  # after the main ruby code that can be read through DATA. Which looks like:
  #
  # foo.bar
  #
  # __END__
  # some other content that isn't read by ripper normally
  prepend(
    Module.new do
      def initialize(source, *args)
        super(source, *args)
        @source = source
        @ending = nil
      end

      def self.prepended(base)
        base.attr_reader :source, :ending
      end

      private

      def on___end__(body)
        @ending = super(source.split("\n")[lineno..-1].join("\n"))
      end

      def on_program(*body)
        super(*body).tap { |sexp| sexp[:body][0][:body] << ending if ending }
      end
    end
  )

  # Adds the used quote type onto string nodes. This is necessary because we're
  # going to have to stick to whatever quote the user chose if there are escape
  # sequences within the string. For example, if you have '\n' we can't switch
  # to double quotes without changing what it means.
  prepend(
    Module.new do
      private

      def on_tstring_end(quote)
        last_sexp.merge!(quote: quote)
      end

      def on_label_end(quote)
        last_sexp.merge!(quote: quote[0]) # quote is ": or ':
      end
    end
  )

  # Normally access controls are reported as vcall nodes. This module creates a
  # new node type to explicitly track those nodes instead, so that the printer
  # can add new lines as necessary.
  prepend(
    Module.new do
      KEYWORDS = %w[private protected public].freeze

      def initialize(source, *args)
        super(source, *args)
        @lines = source.split("\n")
      end

      def self.prepended(base)
        base.attr_reader :lines
      end

      private

      def on_vcall(ident)
        super(ident).tap do |sexp|
          if !KEYWORDS.include?(ident[:body]) ||
             ident[:body] != lines[lineno - 1].strip
            next
          end

          sexp.merge!(type: :access_ctrl)
        end
      end
    end
  )

  # When the only statement inside of a `def` node is a `begin` node, then you
  # can safely replace the body of the `def` with the body of the `begin`. For
  # example:
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
  # This module handles this by hoisting up the `bodystmt` node from the inner
  # `begin` up to the `def`.
  prepend(
    Module.new do
      private

      def on_def(ident, params, bodystmt)
        def_bodystmt = bodystmt
        stmts, *other_parts = bodystmt[:body]

        if !other_parts.any? && stmts[:body].length == 1 &&
           stmts.dig(:body, 0, :type) == :begin
          def_bodystmt = stmts.dig(:body, 0, :body, 0)
        end

        super(ident, params, def_bodystmt)
      end
    end
  )

  # By default, Ripper parses the expression `lambda { foo }` as a
  # `method_add_block` node, so we can't turn it back into `-> { foo }`. This
  # module overrides that behavior and reports it back as a `lambda` node
  # instead.
  prepend(
    Module.new do
      private

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
    end
  )
end

# If this is the main file we're executing, then most likely this is being
# executed from the parse.js spawn. In that case, read the ruby source from
# stdin and report back the AST over stdout.

if $0 == __FILE__
  builder = RipperJS.new($stdin.read)
  response = builder.parse

  if !response && builder.error?
    STDERR.puts 'Invalid ruby'
    exit 1
  end

  puts JSON.fast_generate(response)
end
