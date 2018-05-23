def foo(a, b, c = 1, d = 2, *e, f, g, h:, i:, j: 1, k: 2, **l, &block)
  'what'
end

foo(1)
foo(1, 2)
foo(1, 2, *abc)
foo(1, 2, *abc, 3, 4)

foo(*bar)
foo(**baz)
foo(&block)

foo(*bar, &block)
foo(**baz, &block)
foo(*bar, **baz, &block)

foo(h: 1, **bar)
foo(**bar, h: 1)
foo(h: 1, **bar, i: 2)
