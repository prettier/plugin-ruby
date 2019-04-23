# frozen_string_literal: true

require 'json' unless defined?(JSON)

module Prettier
  PLUGIN = -File.expand_path('..', __dir__)
  BINARY = -File.join(PLUGIN, 'node_modules', 'prettier', 'bin-prettier.js')
  VERSION = -JSON.parse(File.read(File.join(PLUGIN, 'package.json')))['version']

  class << self
    def run(args)
      quoted = args.map { |arg| arg.start_with?('-') ? arg : "'#{arg}'" }
      command = "node #{BINARY} --plugin '#{PLUGIN}' #{quoted.join(' ')}"

      system({ 'RBPRETTIER' => '1' }, command)
    end
  end
end
