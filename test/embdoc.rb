# frozen_string_literal: true

=begin
this is

some really

long documentation
that is contained
in an embdoc
=end

class Foo
=begin
this is an embdoc inside a class
=end
end

module Foo
  class Foo
=begin
this is an embdoc even more indented
=end
  end
end
