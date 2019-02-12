# frozen_string_literal: true

# rubocop:disable Lint/Void

''

'abc'

"abc's"

"abc"

"#{abc} abc"

"{\"abc\": \"foo\nbar\"}"

"abc #{foo; bar} abc"

"abc #{de} fghi #{jkl} mno"

'abc' \
  'def' \
  'ghi'

"abc #{"abc #{abc} abc"} abc"

{ 'a' => 1 }

{ "a #{a}" => 1 }

:"abc#{abc}abc"

%x[abc]

%x[super_super_super_super_super_super_super_super_super_super_super_super_su_long]

<<-HERE
This is a straight heredoc!
HERE

<<-HERE
This is another straight heredoc, this time with interpolation!
#{interpolation}
So interpolated right now.
HERE

abc = <<-HERE
This is a straight heredoc on an assign!
HERE

<<-PARENT
This is a straight heredoc!
#{
<<-CHILD
Why do I do this
CHILD
}
PARENT

<<~HERE
  This is a squiggly heredoc!
HERE

<<~HERE
    This is another squiggly heredoc, this time with interpolation!
    #{interpolation}
    So interpolated right now.
HERE

abc = <<~HERE
  This is a squiggly heredoc on an assign!
HERE

<<~PARENT
  This is a squiggly heredoc!
  #{
    <<~CHILD
      Why do I do this
    CHILD
  }
PARENT

<<-GRAND
#{'interpolated'}
<<~PARENT
  #{'more interpolated'}
    <<-CHILD
      #{'what is going on'}
    CHILD
  #{'more interpolated'}
PARENT
#{'interpolated'}
GRAND

'abc "abc" abc'

# rubocop:enable Lint/Void
