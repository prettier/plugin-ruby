# frozen_string_literal: true

require 'bundler/setup' if ENV['PLUGIN_RUBY_CI']
require 'socket'
require 'json'

require_relative '../ruby/parser'
require_relative '../rbs/parser'
require_relative '../haml/parser'

# Set the program name so that it's easy to find if we need it
$PROGRAM_NAME = 'prettier-ruby-parser'

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:QUIT) { quit = true } if RUBY_PLATFORM != 'java'
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

sockfile = ARGV.first || "/tmp/#{$PROGRAM_NAME}.sock"
server = UNIXServer.new(sockfile)

at_exit do
  server.close
  File.unlink(sockfile)
end

loop do
  break if quit

  # Start up a new thread that will handle each successive connection.
  Thread.new(server.accept_nonblock) do |socket|
    parser, source = socket.read.force_encoding('UTF-8').split('|', 2)

    response =
      case parser
      when 'ruby'
        Prettier::Parser.parse(source)
      when 'rbs'
        Prettier::RBSParser.parse(source)
      when 'haml'
        Prettier::HAMLParser.parse(source)
      end

    if response
      socket.write(JSON.fast_generate(response))
    else
      socket.write('{ "error": true }')
    end
  rescue Prettier::Parser::ParserError => error
    loc = { start: { line: error.lineno, column: error.column } }
    socket.write(JSON.fast_generate(error: error.message, loc: loc))
  rescue StandardError => error
    socket.write(JSON.fast_generate(error: error.message))
  ensure
    socket.close
  end
rescue IO::WaitReadable, Errno::EINTR
  # Wait for select(2) to give us a connection that has content for 1 second.
  # Otherwise timeout and continue on (so that we hit our "break if quit"
  # pretty often).
  IO.select([server], nil, nil, 1)

  retry unless quit
end
