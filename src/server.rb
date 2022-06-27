# frozen_string_literal: true

require "bundler/setup"
require "socket"
require "json"
require "fileutils"
require "open3"

require "prettier_print"
require "syntax_tree"
require "syntax_tree/haml"
require "syntax_tree/rbs"

# First, require all of the plugins that the user specified.
ARGV.shift[/^--plugins=(.*)$/, 1]
  .split(",")
  .each { |plugin| require "syntax_tree/#{plugin}" }

# Make sure we trap these signals to be sure we get the quit command coming from
# the parent node process
quit = false
trap(:INT) { quit = true }
trap(:TERM) { quit = true }

if Signal.list.key?("QUIT") && RUBY_ENGINE != "jruby"
  trap(:QUIT) { quit = true }
end

# The information variable stores the actual connection information, which will
# either be an IP address and port or a path to a unix socket file.
information = ""

# The candidates array is a list of potential programs that could be used to
# connect to our server. We'll run through them after the server starts to find
# the best one to use.
candidates = []

if Gem.win_platform?
  # If we're on windows, we're going to start up a TCP server. The 0 here means
  # to bind to some available port.
  server = TCPServer.new("127.0.0.1", 0)
  address = server.local_address

  # Ensure that we close the server when this process exits.
  at_exit { server.close }

  information = "#{address.ip_address} #{address.ip_port}"
  candidates = %w[nc telnet]
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

  information = server.local_address.unix_path
  candidates = ["nc -w 3 -U", "ncat -w 3 -U"]
end

# This is the actual listening thread that will be acting as our server. We have
# to start it in another thread to begin with so that we can run through our
# candidate connection programs. Eventually we'll just join into this thread
# though and it will act as a daemon.
listener =
  Thread.new do
    loop do
      break if quit

      # Start up a new thread that will handle each successive connection.
      Thread.new(server.accept_nonblock) do |socket|
        parser, maxwidth_string, tabwidth_string, source =
          socket.read.force_encoding("UTF-8").split("|", 4)

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
        scalar = tabwidth_string.to_i / 2
        genspace = ->(n) { " " * n * scalar }

        maxwidth = maxwidth_string.to_i
        response =
          case parser
          when "ping"
            "pong"
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
            formatter = PrettierPrint.new(+"", maxwidth, "\n", &genspace)
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
          # Do nothing, the pipe has been closed by the parent process so we don't
          # actually care about writing to it anymore.
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

# Map each candidate connection method to a thread that will check if it works.
candidates.map! do |candidate|
  Thread.new do
    Thread.current.report_on_exception = false

    # We do not care about stderr here, so throw it away
    stdout, _stderr, status =
      Open3.capture3("#{candidate} #{information}", stdin_data: "ping")

    candidate if JSON.parse(stdout) == "pong" && status.exitstatus == 0
  rescue StandardError
    # We don't actually care if this fails, because we'll just skip that
    # connection option.
  end
end

# Find the first one prefix that successfully returned the correct value.
prefix =
  candidates.detect do |candidate|
    value = candidate.value
    break value if value
  end

# Default to running the netcat.js script that we ship with the plugin. It's a
# good fallback as it will always work, but it is slower than the other options.
prefix ||= "node #{File.expand_path("netcat.js", __dir__)}"

# Write out our connection information to the file given as the first argument
# to this script.
File.write(ARGV[0], "#{prefix} #{information}")

listener.join
