loop { 1 }

loop do
  1
end

loop { super_super_super_super_super_super_super_super_super_super_super_super_super_super_long }

loop do
  super_super_super_super_super_super_super_super_super_super_super_super_super_super_long
end

loop { |i| 1 }

loop do |i|
  i
end

loop { |*| i }

loop { |(a, b)| i }

loop { |a, (b, c), d, *e| i }

loop { |i| super_super_super_super_super_super_super_super_super_super_super_super_super_super_long }

loop do |i|
  super_super_super_super_super_super_super_super_super_super_super_super_super_super_long
end

loop { |i| i.to_s }

loop do |i|
  i.to_s
end

loop { |i, j| i.to_s }

for i in [1, 2, 3] do
  p i
end

target.method object.map do |arg|
  arg * 2
end
