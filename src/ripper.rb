#!/usr/bin/env ruby

require 'json'
require 'ripper'

class RipperJS < Ripper::SexpBuilder
  attr_reader :block_comments, :inline_comments
  attr_reader :current_embdoc, :heredoc_stack
  attr_reader :last_sexp

  REQUIRED_RUBY_VERSION = '2.5'

  def initialize(*args)
    if Gem::Version.new(RUBY_VERSION) < Gem::Version.new(REQUIRED_RUBY_VERSION)
      raise "Ruby version #{RUBY_VERSION} not supported. Please upgrade to #{REQUIRED_RUBY_VERSION} or above."
    end

    super

    @block_comments = []
    @inline_comments = []

    @current_embdoc = nil
    @heredoc_stack = []

    @last_sexp = nil
  end

  private

  # This one is weird, but basically we want to steal the comments that were
  # attached to the right side of the hash association
  def on_assoc_new(left, right)
    build_sexp(:assoc_new, [left, right]).tap do |sexp|
      next unless right[:comments]

      sexp.merge!(comments: right.delete(:comments))
    end
  end

  def on_bodystmt(*body)
    build_sexp(:bodystmt, body).tap do |sexp|
      attach_comments_to(sexp, body[0])
    end
  end

  def on_CHAR(char)
    @last_sexp = { type: :@CHAR, body: char, start: lineno, end: lineno }
  end

  def on_class(*body)
    build_sexp(:class, body).tap do |sexp|
      attach_comments_to(sexp, body[2][:body][0])
    end
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
  def on_comment(comment)
    sexp = { type: :@comment, body: comment.force_encoding('UTF-8').chomp, start: lineno, end: lineno }

    case RipperJS.lex_state_name(state)
    when 'EXPR_BEG'
      block_comments << sexp
    when 'EXPR_END', 'EXPR_ARG|EXPR_LABELED', 'EXPR_ENDFN'
      last_sexp.merge!(comments: [sexp])
    when 'EXPR_CMDARG', 'EXPR_END|EXPR_ENDARG', 'EXPR_ENDARG', 'EXPR_ARG', 'EXPR_FNAME|EXPR_FITEM', 'EXPR_CLASS', 'EXPR_END|EXPR_LABEL'
      @inline_comments << sexp
    when 'EXPR_BEG|EXPR_LABEL', 'EXPR_MID'
      @inline_comments << sexp.merge!(break: true)
    when 'EXPR_DOT'
      last_sexp.merge!(comments: [sexp.merge!(break: true)])
    end
  end

  def on_def(*body)
    build_sexp(:def, body).tap do |sexp|
      attach_comments_to(sexp, body[2][:body][0])
    end
  end

  def on_defs(*body)
    build_sexp(:defs, body).tap do |sexp|
      attach_comments_to(sexp, body[4][:body][0])
    end
  end

  def on_embdoc_beg(comment)
    @current_embdoc = { type: :embdoc, body: comment, start: lineno, end: lineno }
  end

  def on_embdoc(comment)
    current_embdoc[:body] << comment
  end

  def on_embdoc_end(comment)
    current_embdoc[:body] << comment.chomp
    block_comments << current_embdoc
    @current_embdoc = nil
  end

  def on_embexpr_beg(body)
    build_scanner_event(:embexpr_beg, body).tap do |node|
      heredoc_stack << node
    end
  end

  def on_embexpr_end(body)
    build_scanner_event(:embexpr_end, body).tap do
      heredoc_stack.pop
    end
  end

  def on_heredoc_beg(beginning)
    heredoc_stack << { type: :heredoc, beginning: beginning, start: lineno, end: lineno }
  end

  def on_heredoc_end(ending)
    heredoc_stack[-1].merge!(ending: ending.chomp, end: lineno)
  end

  def on_heredoc_dedent(string, _width)
    string.merge!(heredoc_stack.pop.slice(:type, :beginning, :ending, :start, :end))
  end

  def on_if(*body)
    build_sexp(:if, body).tap do |sexp|
      attach_comments_to(sexp, body[1])
    end
  end

  def on_method_add_block(*body)
    build_sexp(:method_add_block, body).tap do |sexp|
      stmts = body[1][:body][1][:type] == :stmts ? body[1][:body][1] : body[1][:body][1][:body][0]
      attach_comments_to(sexp, stmts)
    end
  end

  def on_program(*body)
    build_sexp(:program, body).tap do |sexp|
      sexp.merge!(start: 1)
      attach_comments_to(sexp, body[0])
    end
  end

  def on_sclass(*body)
    build_sexp(:sclass, body).tap do |sexp|
      attach_comments_to(sexp, body[1][:body][0])
    end
  end

  def on_string_literal(string)
    if heredoc_stack.any? && string[:type] != :heredoc && heredoc_stack[-1][:type] == :heredoc
      string.merge!(heredoc_stack.pop.slice(:type, :beginning, :ending, :start, :end))
    else
      build_parser_event(:string_literal, [string])
    end
  end

  def on_unless(*body)
    build_sexp(:unless, body).tap do |sexp|
      attach_comments_to(sexp, body[1])
    end
  end

  def on_when(*body)
    build_sexp(:when, body).tap do |sexp|
      attach_comments_to(sexp, body[1])
    end
  end

  def attach_comments_to(sexp, stmts)
    range = sexp[:start]..sexp[:end]
    comments = block_comments.group_by { |comment| range.include?(comment[:start]) }

    if comments[true]
      stmts[:body] = (stmts[:body] + comments[true]).sort_by { |node| node[:start] }
      @block_comments = comments.fetch(false) { [] }
    end
  end

  %i[ident tstring_content].each do |event|
    define_method(:"on_#{event}") do |body|
      build_scanner_event(event, body.force_encoding('UTF-8'))
    end
  end

  %i[args mlhs mrhs qsymbols qwords regexp stmts string symbols words xstring].each do |event|
    suffix = event == :string ? :content : :new
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

  defined_events = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }

  (SCANNER_EVENTS - defined_events).each do |event|
    define_method(:"on_#{event}") do |body|
      build_scanner_event(event, body)
    end
  end

  (PARSER_EVENTS - defined_events).each do |event|
    define_method(:"on_#{event}") do |*body|
      build_parser_event(event, body)
    end
  end

  def build_parser_event(type, body)
    build_sexp(type, body).tap do |sexp|
      next if inline_comments.empty? || type == :args_add_block

      sexp[:comments] = inline_comments.reverse
      @inline_comments = []
    end
  end

  def build_scanner_event(type, body)
    { type: :"@#{type}", body: body, start: lineno, end: lineno }
  end

  def build_sexp(type, body)
    start = body.map { |part| part.is_a?(Hash) ? part[:start] : lineno }.min || lineno
    @last_sexp = { type: type, body: body, start: start, end: lineno }
  end
end

if $0 == __FILE__
  response = RipperJS.new($stdin.read).parse

  if response.nil?
    STDERR.puts 'Invalid ruby'
    exit 1
  end

  puts JSON.fast_generate(response)
end
