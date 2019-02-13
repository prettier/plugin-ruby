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
rescue SomeSuperSuperLongError, SomeOtherSuperSuperLongError, OneLastSuperLongError
  3
rescue
  4
else
  5
ensure
  6
end

a rescue nil

# from ruby spec/ruby/language/rescue_spec.rb
def foo
  a
rescue A, *B => e
  e
end
