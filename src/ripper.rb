#!/usr/bin/env ruby

require 'json'
require 'ripper'

class RipperJS < Ripper::SexpBuilder
  attr_reader :block_comments, :inline_comment, :current_embdoc
  attr_reader :last_sexp

  def initialize(*args)
    if Gem::Version.new(RUBY_VERSION) < Gem::Version.new('2.5')
      raise 'Unsupported ruby version'
    end

    super

    @block_comments = []
    @inline_comment = nil
    @current_embdoc = nil

    @last_sexp = nil
  end

  def parse
    super.tap do |sexp|
      sexp[:body][0][:body] = (block_comments + sexp.dig(:body, 0, :body)).sort_by { |node| node[:line] }
    end
  end

  private

  SCANNER_EVENTS.each do |event|
    module_eval(<<-End, __FILE__, __LINE__ + 1)
      def on_#{event}(token)
        { type: :@#{event}, body: token, line: lineno }
      end
    End
  end

  events = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }
  (PARSER_EVENTS - events).each do |event|
    module_eval(<<-End, __FILE__, __LINE__ + 1)
      def on_#{event}(*body)
        build_sexp(:#{event}, body)
      end
    End
  end

  def on_stmts_new
    { type: :stmts, body: [], line: lineno }
  end

  def on_stmts_add(stmts, stmt)
    stmts.tap { |node| node[:body] << stmt }
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
    sexp = { type: :@comment, body: comment.chomp, line: lineno }

    case RipperJS.lex_state_name(state)
    when 'EXPR_BEG'
      block_comments << sexp
    when 'EXPR_END', 'EXPR_ARG|EXPR_LABELED', 'EXPR_ENDFN'
      last_sexp.merge!(comment: sexp)
    when 'EXPR_CMDARG', 'EXPR_ENDARG', 'EXPR_ARG', 'EXPR_FNAME|EXPR_FITEM', 'EXPR_CLASS'
      @inline_comment = sexp
    when 'EXPR_BEG|EXPR_LABEL', 'EXPR_MID'
      @inline_comment = sexp.merge!(break: true)
    when 'EXPR_DOT'
      last_sexp.merge!(comment: sexp.merge!(break: true))
    end
  end

  def on_embdoc_beg(comment)
    @current_embdoc = { type: :@embdoc, body: comment, line: lineno }
  end

  def on_embdoc(comment)
    current_embdoc[:body] << comment
  end

  def on_embdoc_end(comment)
    current_embdoc[:body] << comment.chomp
    block_comments << current_embdoc
    @current_embdoc = nil
  end

  def on_magic_comment(*); end

  def attach_comments_to(sexp, stmts)
    range = first_line_from(sexp)..sexp[:line]
    comments = block_comments.group_by { |comment| range.include?(comment[:line]) }

    if comments[true]
      stmts[:body] = (stmts[:body] + comments[true]).sort_by { |node| node[:line] }
      @block_comments = comments.fetch(false) { [] }
    end
  end

  def on_def(*body)
    { type: :def, body: body, line: lineno }.tap do |sexp|
      attach_comments_to(sexp, body[2][:body][0])
      @last_sexp = sexp
    end
  end

  def on_method_add_block(*body)
    { type: :method_add_block, body: body, line: lineno }.tap do |sexp|
      attach_comments_to(sexp, body[1][:body][1][:body][0])
      @last_sexp = sexp
    end
  end

  def on_bodystmt(*body)
    { type: :bodystmt, body: body, line: lineno }.tap do |sexp|
      attach_comments_to(sexp, body[0])
      @last_sexp = sexp
    end
  end

  NO_COMMENTS = %i[
    regexp_add
    regexp_new
    string_add
    string_content
  ].freeze

  def build_sexp(type, body)
    { type: type, body: body, line: lineno }.tap do |sexp|
      if inline_comment && !NO_COMMENTS.include?(type)
        sexp[:comment] = inline_comment
        @inline_comment = nil
      end

      @last_sexp = sexp
    end
  end

  def first_line_from(sexp)
    lines = []
    queue = [sexp]

    while queue.any?
      current = queue.shift

      case current
      when Array
        queue += current.compact
      when Hash
        lines << current[:line]
        queue += current[:body].compact if current[:body].is_a?(Array)
      end
    end

    lines.min
  end
end

if $0 == __FILE__
  response = RipperJS.new(ARGV[0]).parse

  if response.nil?
    STDERR.puts 'Invalid ruby'
    exit 1
  end

  puts JSON.dump(response)
end
