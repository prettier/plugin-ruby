# frozen_string_literal: true

require_relative '../../src/ripper'

loop do
  lines, line = [], nil
  lines << line while (line = gets) != "---\n"

  parser = RipperJS.new(lines.join)

  STDOUT.puts JSON.fast_generate(parser.parse)
  STDOUT.flush
end
