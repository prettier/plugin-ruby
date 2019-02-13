# frozen_string_literal: true

# rubocop:disable Lint/Void

[]

[1, 2, 3]

# rubocop:disable Style/WordArray
# We need to fix this, but it can't be done until we get the args_new and
# args_add refactor done.
['a', 'b', 'c']
# rubocop:enable Style/WordArray

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
