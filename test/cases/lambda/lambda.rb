# frozen_string_literal: true

-> { 1 }

->(a, b, c) { a + b + c }

-> { super_super_super_super_super_super_super_super_super_super_super_super_long }

->(a, b, c) { a + b + c + super_super_super_super_super_super_super_super_super_long }

a.(1, 2, 3)

a.call(1, 2, 3)

a[]

a[1, 2, 3]

-> a { a }

-> () { 1 }

command :foobar, ->(argument) { argument + argument }
comm.and :foobar, ->(argument) { argument + argument }

command :fooooooooooooobaaaaaaarrrrr, ->(argument) { argument + argument + argument + argument + argument + argument }
comm.and :fooooooooooooobaaaaaaarrrrr, ->(argument) { argument + argument + argument + argument + argument + argument }

# rubocop:disable Metrics/LineLength
command :fooooooooooooobaaaaaaarrrrr, ->(_fooooooooooooobaaaaaaarrrrr1, _fooooooooooooobaaaaaaarrrrr2, _fooooooooooooobaaaaaaarrrrr3) { true }
# rubocop:enable Metrics/LineLength
