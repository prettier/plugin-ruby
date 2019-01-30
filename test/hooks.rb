# frozen_string_literal: true
# rubocop:disable Style/BeginBlock

BEGIN { p 'begin' } # first

BEGIN {
  super_super_super_super_super_super_super_super_super_super_super_super_super_super_long # second
}

BEGIN { super_super_super_super_super_super_super_super_super_super_super_super_super_super_long } # third

END { p 'end' } # fourth

END {
  super_super_super_super_super_super_super_super_super_super_super_super_super_super_long # fifth
}

END { super_super_super_super_super_super_super_super_super_super_super_super_super_super_long } # sixth
