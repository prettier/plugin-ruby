# frozen_string_literal: true

module Prettier
  require 'json' unless defined?(JSON)
  package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

  VERSION = package['version']

  class << self
    def run(args)
      prettier = File.expand_path(File.join('../exe/nodejs', target), __dir__)
      plugin = File.expand_path(File.join('..'), __dir__)
      quoted = args.map { |arg| arg.start_with?('-') ? arg : "'#{arg}'" }

      system "#{prettier} --plugin '#{plugin}' #{quoted.join(' ')}"
    end

    private

    def target
      case RUBY_PLATFORM
      when /darwin/
        'prettier-macos'
      when /linux/
        'prettier-linux'
      when /win32/
        'prettier-win.exe'
      else
        raise "Unsupported platform #{RUBY_PLATFORM}"
      end
    end
  end
end
