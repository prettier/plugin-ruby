begin
  1
rescue StandardError
  retry
rescue NoMethodError => exception
  redo
rescue
  2
else
  3
ensure
  4
end
