# frozen_string_literal: true

# rubocop:disable Lint/Void

defined? a # first

defined?(a) # second

defined? super_super_super_super_super_super_super_super_super_super_super_super_long

defined?(super_super_super_super_super_super_super_super_super_super_super_super_long)

defined?(
  super_super_super_super_super_super_super_super_super_super_super_super_long
)

defined?(a) # third

# rubocop:enable Lint/Void
