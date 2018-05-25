begin
  1
rescue StandardError
  retry
rescue NoMethodError => exception
  redo
rescue StandardError, NoMethodError
  2
rescue
  3
else
  4
ensure
  5
end

a rescue nil
