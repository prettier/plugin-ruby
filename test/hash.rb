# frozen_string_literal: true

# rubocop:disable Lint/Void

{}

{ a: 'a', b: 'b', c: 'c' }

{ :a => 'a', :b => 'b', :c => 'c' }

{ Foo => 1, Bar => 2 }

{
  super_super_super_super_super_super_super_super_long:
    super_super_super_super_super_super_super_super_long,
  super_super_super_super_super_super_super_super_super_long: {
    super_super_super_super_super_super_super_super_long:
      super_super_super_super_super_super_super_super_long
  }
}

foo :abc => true # some comment

foobar alpha: alpha, beta: beta, gamma: gamma, delta: delta, epsilon: epsilon, zeta: zeta
foobar(alpha: alpha, beta: beta, gamma: gamma, delta: delta, epsilon: epsilon, zeta: zeta)

# rubocop:enable Lint/Void
