# frozen_string_literal: true

# rubocop:disable Lint/UselessAssignment, Style/ParallelAssignment

a = 1

a =
  begin
    2
  end

a, b, c = [1, 2, 3]

a = 1, 2, 3

a, b, c = 1, 2, 3

a, *b = 1, 2, 3

a, *b, c, d = 1, 2, 3

a, * = 1, 2, 3

a = *a

(a, b), c = [1, 2], 3

* = [1, 2, 3]

*, a = [1, 2, 3]

super_super_super_long, super_super_super_long, super_super_super_long =
  super_super_super_super_super_long, super_super_super_super_super_long, super_super_super_super_super_long

a ||= 1

a ||= super_super_super_super_super_super_super_super_super_super_super_super_long

a = [
  super_super_super_super_super_super_super_super_super_super_super_long,
  super_super_super_super_super_super_super_super_super_super_super_long,
  super_super_super_super_super_super_super_super_super_super_super_long
]

a = {
  a: super_super_super_super_super_super_super_super_super_super_long,
  b: super_super_super_super_super_super_super_super_super_super_long,
  c: super_super_super_super_super_super_super_super_super_super_long
}

# rubocop:disable Lint/UnneededCopDisableDirective
# rubocop:disable Layout/MultilineMethodCallIndentation
# I know, I know
a = [
  super_super_super_super_long,
  super_super_super_super_long
].sort

a = {
  a: super_super_super_super_long,
  b: super_super_super_super_long
}.sort
# rubocop:enable Layout/MultilineMethodCallIndentation
# rubocop:enable Lint/UnneededCopDisableDirective

a.a = 1

super_super_super_long.super_super_super_super_super_super_super_long =
  super_super_super_super_super_super_super_super_super_super_super_long

# rubocop:enable Lint/UselessAssignment, Style/ParallelAssignment
