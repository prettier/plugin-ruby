# frozen_string_literal: true

require 'socket'

require_relative '../../src/ruby/parser'
require_relative '../../src/haml/parser'
require_relative '../../src/rbs/parser'

# Set the program name so that it's easy to find if we need it
$PROGRAM_NAME = 'prettier-ruby-test-parser'

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:QUIT) { quit = true }
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

server = TCPServer.new(ARGV.first || 22_021)

loop do
  break if quit

  # Start up a new thread that will handle each successive connection.
  Thread.new(server.accept_nonblock) do |socket|
    message = socket.readpartial(10 * 1024 * 1024)
    parser, source = message.force_encoding('UTF-8').split('|', 2)

    response =
      case parser
      when 'ruby'
        Prettier::Parser.parse(source)
      when 'rbs'
        Prettier::RBSParser.parse(source)
      when 'haml'
        Prettier::HAMLParser.parse(source)
      end

    if !response
      socket.puts('{ "error": true }')
    else
      socket.puts(JSON.fast_generate(response))
    end

    socket.close
  end
rescue IO::WaitReadable, Errno::EINTR
  # Wait for select(2) to give us a connection that has content for 1 second.
  # Otherwise timeout and continue on (so that we hit our "break if quit"
  # pretty often).
  IO.select([server], nil, nil, 1)

  retry unless quit
end
