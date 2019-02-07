# frozen_string_literal: true

# rubocop:disable Lint/Void

''

'abc'

"abc's"

"abc"

"#{abc} abc"

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

<<~HERE
  This is a squiggly heredoc!
HERE

<<~HERE
    This is another squiggly heredoc!
HERE

abc = <<~HERE
  This is a squiggly heredoc on an assign!
HERE

# rubocop:enable Lint/Void
