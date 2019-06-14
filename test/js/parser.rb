# frozen_string_literal: true

require_relative '../../src/ripper'

loop do
  lines, line = [], nil

  i = 0
  while (line = gets) != "---\n" do
    lines << line
    i += 1
    if i > 100
      break
    end
  end

  parser = RipperJS.new(lines.join)

  STDOUT.puts JSON.fast_generate(parser.parse)
  STDOUT.flush
end
