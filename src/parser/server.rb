# frozen_string_literal: true

require 'bundler/setup' if ENV['PLUGIN_RUBY_CI']
require 'socket'
require 'json'
require 'fileutils'

require_relative '../ruby/parser'
require_relative '../rbs/parser'
require_relative '../haml/parser'

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:INT) { quit = true }
trap(:TERM) { quit = true }
trap(:QUIT) { quit = true } if Signal.list.key?('QUIT')

info =
  if Gem.win_platform?
    # If we're on windows, we're going to start up a TCP server. The 0 here means
    # to bind to some available port.
    server = TCPServer.new('127.0.0.1', 0)

    # Ensure that we close the server when this process exits.
    at_exit { server.close }

    address = server.local_address
    "#{address.ip_address} #{address.ip_port}"
  else
    # If we're not on windows, then we're going to assume we can use unix socket
    # files (since they're faster than a TCP server).
    filepath = "/tmp/prettier-ruby-parser-#{Process.pid}.sock"
    server = UNIXServer.new(filepath)

    # Ensure that we close the server and delete the socket file when this
    # process exits.
    at_exit do
      server.close
      File.unlink(filepath)
    end

    server.local_address.unix_path
  end

# Write out our connection information to the file given as the first argument
# to this script.
File.write(ARGV[0], info)

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
