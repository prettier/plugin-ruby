# frozen_string_literal: true

require "bundler/setup"
require "json"
require "socket"

require "syntax_tree"

# Optional dependencies
%W[syntax_tree/rbs syntax_tree/haml prettier_print].each do |dep|
  begin
    require dep
  rescue LoadError
  end
end

# First, require all of the plugins that the user specified.
ARGV.shift[/^--plugins=(.*)$/, 1]
  .split(",")
  .each { |plugin| require "syntax_tree/#{plugin}" }

# Next, get the file where we should write our connection information.
connection_filepath = ARGV.shift

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

if Signal.list.key?("QUIT") && RUBY_ENGINE != "jruby"
  trap(:QUIT) { quit = true }
end

connection_information =
  if Gem.win_platform?
    # If we're on windows, we're going to start up a TCP server. The 0 here
    # means to bind to some available port.
    server = TCPServer.new(0)
    address = server.local_address

    # Ensure that we close the server when this process exits.
    at_exit { server.close }

    # Return the connection information.
    { address: address.ip_address, port: address.ip_port }
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

    # Return the connection information.
    { path: server.local_address.unix_path }
  end

# This is the actual listening thread that will be acting as our server. We have
# to start it in another thread in order to properly trap the signals in this
# parent thread.
listener =
  Thread.new do
    loop do
      break if quit

      # Start up a new thread that will handle each successive connection.
      Thread.new(server.accept_nonblock) do |socket|
        request = JSON.parse(socket.read.force_encoding("UTF-8"))
        source = request["source"]

        source.each_line do |line|
          case line
          when /^\s*#.+?coding/
            # If we've found an encoding comment, then we're going to take that
            # into account and reclassify the encoding for the source.
            encoding = Ripper.new(line).tap(&:parse).encoding
            source = source.force_encoding(encoding)
            break
          when /^\s*#/
            # continue
          else
            break
          end
        end

        # At the moment, we're not going to support odd tabwidths. It's going to
        # have to be a multiple of 2, because of the way that the prettyprint
        # gem functions. So we're going to just use integer division here.
        scalar = request["tabwidth"].to_i / 2
        genspace = ->(n) { " " * n * scalar }

        maxwidth = request["maxwidth"].to_i
        response =
          case request["parser"]
          when "ruby"
            formatter =
              SyntaxTree::Formatter.new(source, [], maxwidth, "\n", &genspace)
            SyntaxTree.parse(source).format(formatter)
            formatter.flush
            formatter.output.join
          when "rbs"
            formatter =
              SyntaxTree::RBS::Formatter.new(
                source,
                [],
                maxwidth,
                "\n",
                &genspace
              )
            SyntaxTree::RBS.parse(source).format(formatter)
            formatter.flush
            formatter.output.join
          when "haml"
            formatter =
              if defined?(SyntaxTree::Haml::Format::Formatter)
                SyntaxTree::Haml::Format::Formatter.new(
                  source,
                  +"",
                  maxwidth,
                  "\n",
                  &genspace
                )
              else
                PrettierPrint.new(+"", maxwidth, "\n", &genspace)
              end

            SyntaxTree::Haml.parse(source).format(formatter)
            formatter.flush
            formatter.output
          end

        if response
          socket.write(JSON.fast_generate(response.force_encoding("UTF-8")))
        else
          socket.write("{ \"error\": true }")
        end
      rescue SyntaxTree::Parser::ParseError => error
        loc = { start: { line: error.lineno, column: error.column } }
        socket.write(JSON.fast_generate(error: error.message, loc: loc))
      rescue StandardError => error
        begin
          socket.write(JSON.fast_generate(error: error.message))
        rescue Errno::EPIPE
          # Do nothing, the pipe has been closed by the parent process so we
          # don't actually care about writing to it anymore.
        end
      ensure
        socket.close
      end
    rescue IO::WaitReadable, Errno::EINTR
      # Wait for select(2) to give us a connection that has content for 1
      # second. Otherwise timeout and continue on (so that we hit our
      # "break if quit" pretty often).
      IO.select([server], nil, nil, 1)

      retry unless quit
    end
  end

File.write(connection_filepath, JSON.fast_generate(connection_information))
listener.join
