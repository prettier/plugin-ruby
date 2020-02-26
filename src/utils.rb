# frozen_string_literal: true

module Prettier
  module PluginRuby
    module Utils
      # We implement our own version checking here instead of using
      # Gem::Version so that we can use the --disable-gems flag.
      #
      # @see https://github.com/prettier/plugin-ruby/pull/479#issue-380389558
      def self.compatible_ruby_version?(current_version)
        required_version = '2.5'
        min_major, min_minor = required_version.split('.').map(&:to_i)
        major, minor, _patch = current_version.split('.').map(&:to_i)

        return true if major > min_major
        return true if minor >= min_minor

        false
      end

      def self.ensure_compatible_ruby_version!(current_version = RUBY_VERSION)
        return if compatible_ruby_version?(current_version)

        warn(
          "Ruby version #{current_version} not s upported. " \
            "Please upgrade to #{required_version} or above."
        )

        exit 1
      end
    end
  end
end
