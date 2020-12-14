# frozen_string_literal: true

require 'socket'
require_relative '../../src/parser'

# Set the program name so that it's easy to find if we need it
$PROGRAM_NAME = 'prettier-ruby-test-parser'

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:QUIT) { quit = true }
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

server = TCPServer.new(22_020)

loop do
  break if quit

  # Start up a new thread that will handle each successive connection.
  Thread.new(server.accept_nonblock) do |socket|
    source = socket.readpartial(10 * 1024 * 1024)

    builder = Prettier::Parser.new(source.force_encoding('UTF-8'))
    response = builder.parse

    if !response || builder.error?
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
