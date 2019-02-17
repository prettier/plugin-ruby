# frozen_string_literal: true

# rubocop:disable Style/BeginBlock, Style/EndBlock

BEGIN {
  p 'begin'
}

BEGIN { p 'begin' }

BEGIN { super_super_super_super_super_super_super_super_super_super_super_super_long }

BEGIN {
  super_super_super_super_super_super_super_super_super_super_super_super_long
}

END {
  p 'end'
}

END { p 'end' }

END { super_super_super_super_super_super_super_super_super_super_super_super_long }

END {
  super_super_super_super_super_super_super_super_super_super_super_super_long
}

# rubocop:enable Style/BeginBlock, Style/EndBlock
