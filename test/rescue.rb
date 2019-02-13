# frozen_string_literal: true

begin
  1
rescue ArgumentError
  retry
rescue NoMethodError => exception
  puts exception
  redo
rescue SyntaxError, NoMethodError
  2
rescue
  3
else
  4
ensure
  5
end

a rescue nil

# from ruby spec/ruby/language/rescue_spec.rb
def foo
  bar
rescue A, *B => e
  baz
end
