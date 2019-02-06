# frozen_string_literal: true

if a
  super_super_super_super_super_super_super_super_super_super_super_super_long
end

if a
  break # comment
end

if a

else
  b
end

if a
  1
elsif b
  2
end

if a
  super_super_super_super_super_super_super_super_super_super_super_long
else
  super_super_super_super_super_super_super_super_super_super_super_super_long
end

if a
  1
elsif b
  2
elsif c
  3
else
  4
end

unless a
  super_super_super_super_super_super_super_super_super_super_super_super_long
end

# rubocop:disable Style/UnlessElse
unless a
  super_super_super_super_super_super_super_super_super_super_super_long
else
  super_super_super_super_super_super_super_super_super_super_super_super_long
end
# rubocop:enable Style/UnlessElse

1 if a

1 if super_super_super_super_super_super_super_super_super_super_super_super_long

1 unless a

1 unless super_super_super_super_super_super_super_super_super_super_super_suplong

if a
  1
else
  2
end

unless a
  1
else
  2
end

a ? 1 : 2
a ? super_super_super_super_super_super_super_super_super_super_super_long
  : super_super_super_super_super_super_super_super_super_super_super_super_long
