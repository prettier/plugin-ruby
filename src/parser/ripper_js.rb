require 'ripper'

class RipperJS < Ripper::SexpBuilder
  def initialize(*args)
    super

    @comment = nil
    @current = nil
  end

  def self.sexp(src, filename = '-', lineno = 1)
    new(src, filename, lineno).parse
  end

  private

  SCANNER_EVENTS.each do |event|
    module_eval(<<-End, __FILE__, __LINE__ + 1)
      def on_#{event}(token)
        {
          type: :@#{event},
          body: token,
          lineno: lineno,
          column: column
        }
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
    {
      type: type,
      body: body,
      lineno: lineno,
      column: column
    }.tap do |sexp|
      sexp[:comment] = @comment || nil
      @comment = nil
      @current = sexp
    end
  end

  def on_comment(comment)
    sexp = { type: :comment, body: comment, lineno: lineno, column: column }

    if @current
      @current[:comment] = sexp
    else
      @comment = sexp
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
