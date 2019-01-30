#!/usr/bin/env ruby

require 'json'
require 'ripper'

class RipperJS < Ripper::SexpBuilder
  def initialize(*args)
    super

    @comment = nil
    @magic = []
    @stack = []
  end

  def self.sexp(src, filename = '-', lineno = 1)
    new(src, filename, lineno).parse
  end

  private

  SCANNER_EVENTS.each do |event|
    module_eval(<<-End, __FILE__, __LINE__ + 1)
      def on_#{event}(token)
        { type: :@#{event}, body: token, lineno: lineno, column: column }
      end
    End
  end

  events = private_instance_methods(false).grep(/\Aon_/) { $'.to_sym }
  (PARSER_EVENTS - events).each do |event|
    module_eval(<<-End, __FILE__, __LINE__ + 1)
      def on_#{event}(*args)
        build_sexp(:#{event}, args)
      end
    End
  end

  def build_sexp(type, body)
    sexp = { type: type, body: body, lineno: lineno, column: column }

    if @beg_comment && type == :stmts_new
      sexp = {
        type: :stmts_add,
        body: [sexp, @beg_comment],
        lineno: @beg_comment[:lineno],
        column: @beg_comment[:column]
      }

      @beg_comment = nil
    end

    if @end_comment
      sexp[:comment] = @end_comment
      @end_comment = nil
    end

    @stack << sexp
    sexp
  end

  def on_comment(comment)
    sexp = { type: :@comment, body: comment.chomp, lineno: lineno, column: column }

    case RipperJS.lex_state_name(state)
    when 'EXPR_BEG' # on it's own line
      right, left, prev = (-3..-1).map { |index| @stack[index] }

      if !prev || prev[:type] != :stmts_add # the first statement
        @beg_comment = sexp
      elsif left[:type] == :void_stmt # the only statement
        prev[:body][1] = sexp
      else # in the middle of a list of statements
        @stack[-1].merge!(
          body: [
            {
              type: :stmts_add,
              body: [left, right],
              lineno: prev[:body][0][:lineno],
              column: prev[:body][0][:column]
            },
            sexp
          ],
          lineno: lineno,
          column: column
        )
      end
    when 'EXPR_ARG', 'EXPR_ENDFN'
      @end_comment = sexp.merge!(type: :comment)
    when 'EXPR_END'
      @stack[-1].merge!(comment: sexp.merge!(type: :comment))
    else
      raise ArgumentError, 'Found comment in unsupported lexer state'
    end
  end

  def on_embdoc_beg(comment)
    @last_node[:comment] = { type: :embdoc, body: comment, lineno: lineno, column: column }
  end

  def on_embdoc(comment)
    @last_node[:comment][:body] << comment
  end

  def on_embdoc_end(comment)
    @last_node[:comment][:body] << comment
  end
end

if $0 == __FILE__
  response = RipperJS.sexp(*ARGV)

  if response.nil?
    STDERR.puts 'Invalid ruby'
    exit 1
  end

  puts JSON.dump(response)
end
