# frozen_string_literal: true

# rubocop:disable Lint/Void

/abc/

%r{a/b/c}

%r{abc}

%r/abc/

%r[abc]

%r(abc)

/a#{b}c/

/abc/i

%r{abc}i

/#$&/

# rubocop:enable Lint/Void
