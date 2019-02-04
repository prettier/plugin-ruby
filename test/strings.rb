# frozen_string_literal: true

# rubocop:disable Lint/Void

''

'abc'

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

# rubocop:enable Lint/Void
