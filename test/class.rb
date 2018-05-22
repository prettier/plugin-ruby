numbers = [1, 2, 3, 4]

numbers.each do |num|
  begin
    num
  rescue
    retry
  else
    redo
  ensure
    puts 'what'
  end
end
