# frozen_string_literal: true

require 'json' unless defined?(JSON)
require 'open3'

module Prettier
  PLUGIN = -File.expand_path('..', __dir__)
  BINARY = -File.join(PLUGIN, 'node_modules', 'prettier', 'bin-prettier.js')
  VERSION = -JSON.parse(File.read(File.join(PLUGIN, 'package.json')))['version']

  def self.run(args)
    quoted = args.map { |arg| arg.start_with?('-') ? arg : "\"#{arg}\"" }
    command = "node #{BINARY} --plugin \"#{PLUGIN}\" #{quoted.join(' ')}"

    stdout, stderr, status = Open3.capture3({ 'RBPRETTIER' => '1' }, command)
    STDOUT.puts(stdout)

    # If we completed successfully, then just exit out.
    exitstatus = status.exitstatus
    return exitstatus if exitstatus == 0

    if stderr.match?(%r{Cannot find module '/.+?/bin-prettier.js'})
      # If we're missing bin-prettier.js, then it's possible the user installed
      # the gem through git, which wouldn't have installed the requisite
      # JavaScript files.
      STDERR.puts(<<~MSG)
        Could not find the JavaScript files necessary to run prettier.

        If you installed this dependency through git instead of from rubygems,
        it does not install the necessary files by default. To fix this you can
        either install them yourself by cd-ing into the directory where this gem
        is located (#{File.expand_path('..', __dir__)}) and running:
          
          `yarn && yarn prepublishOnly`
           or
           `npm install && npm run prepublishOnly`
           or
           you can change the source in your Gemfile to point directly to rubygems.
      MSG
    else
      # Otherwise, just print out the same error that prettier emitted, as it's
      # unknown to us.
      STDERR.puts(stderr)
    end

    # Make sure we still exit with the same status code the prettier emitted.
    exitstatus
  end
end
