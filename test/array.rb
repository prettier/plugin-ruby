# frozen_string_literal: true

# rubocop:disable Lint/Void

[]

[1, 2, 3]

['a', 'b', 'c']

['a', 'b c', 'd']

[:a, :b, :c]

[:a, :"b c", :d]

%w[a b c]

%i[a b c]

%W[a#{a}a b#{b}a c#{c}c]

%I[a#{a}a b#{b}b c#{c}c]

# rubocop:disable Lint/UnneededSplatExpansion
[1, 2, *[3, 4], 5, 6]
# rubocop:enable Lint/UnneededSplatExpansion

[
  super_super_super_super_super_super_super_super_super_super_super_long,
  super_super_super_super_super_super_super_super_super_super_super_long, [
    super_super_super_super_super_super_super_super_super_super_super_long,
    super_super_super_super_super_super_super_super_super_super_super_long
  ]
]

a[1]

a[super_super_super_super_super_super_super_super_super_super_super_super_sulong]

a[1] = 2

a[super_super_super_super_super_super_super_super_super_super_super_super_sulong] =
  super_super_super_super_super_super_super_super_super_super_super_super_long

a[1] = [
  super_super_super_super_super_super_super_super_super_super_super_long,
  super_super_super_super_super_super_super_super_super_super_super_long
]

# rubocop:enable Lint/Void
