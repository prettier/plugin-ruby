-> { 1 }

a = -> { 1 }

b = ->(a, b, c) { a + b + c }

c = -> { super_super_super_super_super_super_super_super_super_super_super_super_super_super_long }

d = ->(a, b, c) { super_super_super_super_super_super_super_super_super_super_super_super_super_super_long }

a.(1, 2, 3)

a.call(1, 2, 3)

a[]

super_super_super_super_super_super_super_super_super_super_super_super_super_super_long[]

a[1, 2, 3]

-> a { 1 }

-> () { 1 }
