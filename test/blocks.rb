# frozen_string_literal: true

# rubocop:disable Lint/UnusedBlockArgument
# We should fix this to automatically prefix the variables with _.

loop { 1 }

loop do
  1
end

loop do
  # foobar
end

port ENV.fetch('PORT') { 3000 }

loop { super_super_super_super_super_super_super_super_super_super_super_super_long }

loop do
  super_super_super_super_super_super_super_super_super_super_super_long
end

loop { |i| 1 }

loop do |i|
  i
end

loop { |*| i }

loop { |(a, b)| i }

loop { |a, (b, c), d, *e| i }

loop { |i| super_super_super_super_super_super_super_super_super_super_super_super_long }

loop do |i|
  super_super_super_super_super_super_super_super_super_super_long
end

loop { |i| i.to_s }

loop do |i|
  i.to_s
end

loop do |i|
  i.to_s :db
end

loop { |i, j| i.to_s }

for i in [1, 2, 3] do
  p i
end

# rubocop:disable Lint/AmbiguousBlockAssociation
# We should handle this.

target.method object.map do |arg|
  arg * 2
end

# rubocop:enable Lint/UnusedBlockArgument, Lint/AmbiguousBlockAssociation
