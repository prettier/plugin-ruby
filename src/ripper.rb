#!/usr/bin/env ruby

require 'json' unless defined?(JSON)
require 'ripper'

module Layer
  # Some nodes are lists that come back from the parser. They always start with
  # a *_new node (or in the case of string, *_content) and each additional node
  # in the list is a *_add node. This layer takes those nodes and turns them
  # into one node with an array body.
  module Lists
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

  # For most nodes, it's enough to look at the child nodes to determine the
  # start of the parent node. However, for some nodes it's necessary to keep
  # track of the keywords as they come in from the lexer and to modify the start
  # node once we have it.
  module StartLine
    events = %i[begin else elsif ensure rescue until while]

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

  # Nodes that are always on their own line occur when the lexer is in the
  # EXPR_BEG node. Those comments are tracked within the @block_comments
  # instance variable. Then for each node that could contain them, we attach
  # them after the node has been built.
  module BlockComments
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

  # Tracking heredocs in somewhat interesting. Straight-line heredocs are
  # reported as strings, whereas squiggly-line heredocs are reported as
  # heredocs.
  module Heredocs
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

  # These are the event types that contain _actual_ string content. If there is
  # an encoding magic comment at the top of the file, ripper will actually
  # change into that encoding for the storage of the string. This will break
  # everything, so we need to force the encoding back into UTF-8 so that
  # the JSON library won't break.
  module Encoding
    events = %w[comment ident tstring_content]

    events.each do |event|
      define_method(:"on_#{event}") do |body|
        super(body.force_encoding('UTF-8'))
      end
    end
  end

  # This layer keeps track of inline comments as they come in. Ripper itself
  # doesn't attach comments to the AST, so we need to do it manually. In this
  # case, inline comments are defined as any comments wherein the lexer state is
  # not equal to EXPR_BEG (tracked in the BlockComments layer).
  module InlineComments
    # Certain events needs to steal the comments from their children in order
    # for them to display properly.
    events = {
      args_add_block: [:body, 0],
      assoc_new: [:body, 1],
      break: [:body, 0],
      command: [:body, 1],
      string_literal: [:body, 0]
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
            comments = sexp.dig(*path).delete(:comments)
            sexp.merge!(comments: comments) if comments
          end
      end
    end

    SPECIAL_LITERALS = %i[qsymbols qwords symbols words].freeze

    # Special array literals are handled in different ways and so their comments
    # need to be passed up to their parent array node.
    def on_array(*body)
      @last_sexp =
        super(*body).tap do |sexp|
          next unless SPECIAL_LITERALS.include?(body.dig(0, :type))

          comments = sexp.dig(:body, 0).delete(:comments)
          sexp.merge!(comments: comments) if comments
        end
    end

    # Most scanner events don't stand on their own a s-expressions, but the CHAR
    # scanner event is effectively just a string, so we need to track it as a
    # s-expression.
    def on_CHAR(body)
      @last_sexp = super(body)
    end

    # We need to know exactly where the comment is, switching off the current
    # lexer state. In Ruby 2.7.0-dev, that's defined as:
    #
    # enum lex_state_bits {
    #     EXPR_BEG_bit,    /* ignore newline, +/- is a sign. */
    #     EXPR_END_bit,    /* newline significant, +/- is an operator. */
    #     EXPR_ENDARG_bit,    /* ditto, and unbound braces. */
    #     EXPR_ENDFN_bit,    /* ditto, and unbound braces. */
    #     EXPR_ARG_bit,    /* newline significant, +/- is an operator. */
    #     EXPR_CMDARG_bit,    /* newline significant, +/- is an operator. */
    #     EXPR_MID_bit,    /* newline significant, +/- is an operator. */
    #     EXPR_FNAME_bit,    /* ignore newline, no reserved words. */
    #     EXPR_DOT_bit,    /* right after `.' or `::', no reserved words. */
    #     EXPR_CLASS_bit,    /* immediate after `class', no here document. */
    #     EXPR_LABEL_bit,    /* flag bit, label is allowed. */
    #     EXPR_LABELED_bit,    /* flag bit, just after a label. */
    #     EXPR_FITEM_bit,    /* symbol literal as FNAME. */
    #     EXPR_MAX_STATE
    # };
    def on_comment(body)
      sexp = { type: :@comment, body: body.chomp, start: lineno, end: lineno }

      case RipperJS.lex_state_name(state)
      when 'EXPR_END', 'EXPR_ARG|EXPR_LABELED', 'EXPR_ENDFN'
        last_sexp.merge!(comments: [sexp])
      when 'EXPR_CMDARG', 'EXPR_END|EXPR_ENDARG', 'EXPR_ENDARG', 'EXPR_ARG', 'EXPR_FNAME|EXPR_FITEM', 'EXPR_CLASS', 'EXPR_END|EXPR_LABEL'
        inline_comments << sexp
      when 'EXPR_BEG|EXPR_LABEL', 'EXPR_MID'
        inline_comments << sexp.merge!(break: true)
      when 'EXPR_DOT'
        last_sexp.merge!(comments: [sexp.merge!(break: true)])
      end

      sexp
    end

    defined_events = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }

    (Ripper::PARSER_EVENTS - defined_events).each do |event|
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

  # Handles __END__ syntax, which allows individual scripts to keep content
  # after the main ruby code that can be read through DATA.
  module Ending
    def initialize(source, *args)
      super(source, *args)
      @source = source
      @ending = nil
    end

    def self.prepended(base)
      base.attr_reader :source, :ending
    end

    def on___end__(body)
      @ending = super(source.split("\n")[lineno..-1].join("\n"))
    end

    def on_program(*body)
      super(*body).tap { |sexp| sexp[:body][0][:body] << ending if ending }
    end
  end
end

class RipperJS < Ripper::SexpBuilder
  class InvalidRubyVersionError < StandardError
    REQUIRED = Gem::Version.new('2.5')

    def initialize
      super(
        "Ruby version #{RUBY_VERSION} not supported. " \
          "Please upgrade to #{REQUIRED} or above."
      )
    end
  end

  def initialize(*args)
    if Gem::Version.new(RUBY_VERSION) < InvalidRubyVersionError::REQUIRED
      raise InvalidRubyVersionError
    end

    super
  end

  private

  SCANNER_EVENTS.each do |event|
    define_method(:"on_#{event}") do |body|
      { type: :"@#{event}", body: body, start: lineno, end: lineno }
    end
  end

  PARSER_EVENTS.each do |event|
    define_method(:"on_#{event}") do |*body|
      min = body.map { |part| part.is_a?(Hash) ? part[:start] : lineno }.min
      { type: event, body: body, start: min || lineno, end: lineno }
    end
  end

  prepend Layer::Lists
  prepend Layer::StartLine
  prepend Layer::InlineComments
  prepend Layer::BlockComments
  prepend Layer::Heredocs
  prepend Layer::Encoding
  prepend Layer::Ending
end

if $0 == __FILE__
  builder = RipperJS.new($stdin.read)
  response = builder.parse

  if builder.error?
    STDERR.puts 'Invalid ruby'
    exit 1
  end

  puts JSON.fast_generate(response)
end
