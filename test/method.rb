# frozen_string_literal: true

# rubocop:disable Lint/DuplicateMethods, Lint/UnusedMethodArgument
# rubocop:disable Metrics/ParameterLists

# rubocop:disable Style/MethodDefParentheses
# We should handle this by placing parentheses around the arguments.

def foo; end

def foo(); end

def foo alpha
end

def foo(alpha)
end

def self.foo; end

def self.foo(); end

def self.foo alpha
end

def self.foo(alpha)
end

def foo(alpha, beta, *gamma, delta, epsilon:, zeta:, eta: 1, **theta, &block)
  'what'
end

def foo(alpha); 1; end

def foo(*); end

def foo(**); end

foo()

foo(1)
foo(1, 2)
foo(1, 2, *abc)
foo(1, 2, *abc, 3, 4)
foo(aaaaaaa, bbbbbbb, ccccccc, ddddddd, eeeeeee, fffffff, ggggggg, hhhhhhh, iiiiiii)

foo(*bar)
foo(**baz)
foo(&block)

foo(*bar, &block)
foo(**baz, &block)
foo(*bar, **baz, &block)

foo(h: 1, **bar)
foo(**bar, h: 1)
foo(h: 1, **bar, i: 2)

Foo::foo
foo&.foo

# rubocop:enable Lint/DuplicateMethods, Lint/UnusedMethodArgument
# rubocop:enable Metrics/ParameterLists, Style/MethodDefParentheses
