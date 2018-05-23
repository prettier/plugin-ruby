def foo(a:, b:, c: 1, d: 2)
  a + b + c + d
end

foo(a: 1, b: 2, c: 3, d: 4)

hash = { a: 1, b: 2, c: 3 }
foo(**hash, d: 4)
