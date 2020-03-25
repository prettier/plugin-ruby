# frozen_string_literal: true

require_relative '../../src/parser'

loop do
  lines, line = [], nil
  lines << line while (line = gets) != "---\n"

  parser = Parser.new(lines.join)

  STDOUT.puts JSON.fast_generate(parser.parse)
  STDOUT.flush
end
