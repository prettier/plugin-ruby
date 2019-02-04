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
