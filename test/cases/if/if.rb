# frozen_string_literal: true

if a
  super_super_super_super_super_super_super_super_super_super_super_super_long
end

# rubocop:disable Style/Not, Style/NegatedIf, Lint/EmptyExpression
if not a
  b
end

# from ruby test/ruby/test_not.rb
assert_equal(true, (not ()))
# rubocop:enable Style/Not, Style/NegatedIf, Lint/EmptyExpression

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

if a
  b 1
else
  b(2)
end

if a
  b(1)
else
  b 2
end

a b do
  if a
    a 'foo'
  else
    b
  end
end

if Some::Constant.super_super_super_super_super_super_super_super_super_super_long
  1
elsif Some::Constant.super_super_super_super_super_super_super_super_super_super_long
  2
end

unless Some::Constant.super_super_super_super_super_super_super_super_super_super_long
  1
end
