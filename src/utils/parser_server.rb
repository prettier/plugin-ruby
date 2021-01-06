require_relative './../ruby/parser'
require 'socket'

Socket.unix_server_loop(ARGV.last) do |socket, client_addrinfo|
  begin
    request = JSON.parse(socket.read, symbolize_names: true)

    builder = case request[:type]
      when 'ruby' then Prettier::Parser.new(request[:data])
      else        raise "unknown file type #{request[:type]}"
    end

    response = builder.parse

    if !response || builder.error?
      raise 'unknown'
    end

    socket.write(JSON.fast_generate(response))
  rescue StandardError => e
    socket.write(
      'ERROR: @prettier/plugin-ruby encountered an error when attempting to parse ' \
        'the RBS source. This usually means there was a syntax error in the ' \
        "file in question. #{e.message}"
    )
  ensure
    socket.close
  end
end
