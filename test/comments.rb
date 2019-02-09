# this is a comment at
# the beginning of the file

loop do
  # this is the only statement
  # inside this loop
end

loop do
  # this is the first statement
  # inside this loop
  foo
end

loop do
  foo
  # this is the last statement
  # inside this loop
end

def foo
  # these are the only statements
  # inside this method
end

class Foo
  # these are the only statements
  # inside this class
end

module Foo
  # these are the only statements
  # inside this module
end

module Foo
  class Foo
    def foo
      # this comment is inside a method
    end

    def foo
      print message # this is an inline comment
    end

    def self.foo
      # this comment is inside a self method
    end
  end
end

foo # this is an inline comment
bar # this is another inline comment

[
  # these are comments
  # inside of an array
  foo,
  # inside of an array
  bar
]

{
  # these are comments
  foo: 'bar',
  # inside of a hash
  bar: 'baz'
}

foo. # inline comment inside of a dot
  bar

Foo.where(
  foo: bar,
  bar: baz
  # This is a comment
).to_a.find { |foo| foo.foo == bar.foo }

# this is a comment
# at the end of the file
