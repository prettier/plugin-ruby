require 'socket'
require_relative './../ruby/parser'

# A sanity check to kill lingering processes that may get stuck. Theoretically,
# this should not happen, but it's best to be safe and not risking zombies
# running around.
if ENV['PARSER_SERVER_TIMEOUT']
  t = ENV['PARSER_SERVER_TIMEOUT'].to_i

  Thread.new { sleep(t) && abort('Prettier: Ruby parser server timed out') }
end

Socket.unix_server_loop(ARGV.last) do |socket, client_addrinfo|
  begin
    request = JSON.parse(socket.read, symbolize_names: true)

    builder =
      case request[:type]
      when 'ruby'
        Prettier::Parser.new(request[:data])
      else
        raise "unknown file type: #{request[:type].inspect}"
      end

    response = builder.parse

    raise 'could not parse input' if !response || builder.error?

    socket.write(JSON.fast_generate(response))
  rescue StandardError => e
    socket.puts(
      'ERROR: @prettier/plugin-ruby encountered an error when attempting to parse ' \
        'the RBS source. This usually means there was a syntax error in the ' \
        "file in question. (#{e.inspect})"
    )
  ensure
    socket.close
  end
end
