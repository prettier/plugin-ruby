# frozen_string_literal: true

require 'socket'
require 'json'

# Set the program name so that it's easy to find if we need it
$PROGRAM_NAME = 'prettier-ruby-parser'

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:QUIT) { quit = true }
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

sockfile = ARGV.first
server = UNIXServer.new(sockfile)

at_exit do
  server.close
  File.unlink(sockfile)
end

MAX_LEN = 15 * 1024 * 1024

def read_message(socket)
  message = +''

  loop do
    message << socket.readpartial(MAX_LEN)
  rescue EOFError
    break
  end

  JSON.parse(message.force_encoding('UTF-8'), symbolize_names: true)
end

loop do
  break if quit

  # Start up a new thread that will handle each successive connection.
  Thread.new(server.accept_nonblock) do |socket|
    parser, source = read_message(socket).values_at(:type, :data)

    response =
      case parser
      when 'ruby'
        require_relative '../ruby/parser'
        Prettier::Parser.parse(source)
      when 'rbs'
        require_relative '../rbs/parser'
        Prettier::RBSParser.parse(source)
      when 'haml'
        require_relative '../haml/parser'
        Prettier::HAMLParser.parse(source)
      end

    if !response
      socket.write(
        JSON.fast_generate(
          error:
            '@prettier/plugin-ruby encountered an error when attempting to parse ' \
              'the ruby source. This usually means there was a syntax error in the ' \
              'file in question. You can verify by running `ruby -i [path/to/file]`.'
        )
      )
    else
      socket.write(JSON.fast_generate(response))
    end
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
