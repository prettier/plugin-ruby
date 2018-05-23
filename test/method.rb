def foo(a, b, c, d = 1, e = 2)
  a + b + c + d + e
end

def bar(&block)
  block.call
end

foo(1, 2, 3, 4, 5)
