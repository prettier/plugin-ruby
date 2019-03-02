# frozen_string_literal: true

# this is a comment at
# the beginning of the file
# rubocop:disable Lint/Void

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

    def bar
      print message # this is an inline comment
    end

    def self.foo
      # this comment is inside a self method
    end
  end
end

foo # this is an inline comment
bar # this is another inline comment

foo 'bar' # this is an inline comment

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

if foo
  # this is a comment in an if
  bar
end

unless foo
  # this is a comment in an unless
  bar
end

while foo
  # this is a comment at the beginning of a while
  bar
end

while foo
  bar
  # this is a comment at the end of a while
end

until foo
  # this is a comment at the beginning of a until
  bar
end

until foo
  bar
  # this is a comment at the end of a until
end

case foo
when bar
  # this is a comment at the beginning of a when
  1
when baz
  2
  # this is a comment at the end of a when
end

begin
  # comment at the beginning of a begin
  1
rescue
  # comment at the beginning of a rescue
  2
ensure
  # comment at the end of a rescue
  3
end

# rubocop:enable Lint/Void
# this is a comment
# at the end of the file

__END__
    /‾‾‾‾‾\  /‾‾‾‾‾\  /‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾/ /‾‾‾‾‾\
   / /‾‾/ / / /‾‾/ / / /‾‾‾  ‾‾/ /‾‾  ‾‾/ /‾‾  ‾‾/ /‾‾ / /‾‾‾ / /‾‾/ /
  /  ‾‾‾ / /  ‾‾‾_/ / _‾/     / /      / /      / /   / _‾/  /  ‾‾‾_/
 / /‾‾‾‾‾ / /‾\ \  / /__     / /      / /    __/ /_  / /__  / /‾\ \
/_/      /_/  /_/ /____/    /_/      /_/    /_____/ /____/ /_/  /_/
