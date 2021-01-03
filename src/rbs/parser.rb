#!/usr/bin/env ruby

require 'json'
require 'rbs'

# Monkey-patch this so that we can get the character positions.
class RBS::Location
  def to_json(*args)
    {
      start: { line: start_line, column: start_column },
      end: { line: end_line, column: end_column },
      start_pos: start_pos,
      end_pos: end_pos
    }.to_json(*args)
  end
end

class RBS::Types::Function::Param
  def to_json(*a)
    escaped = name && /\A#{RBS::Parser::KEYWORDS_RE}\z/.match?(name)
    { type: type, name: name, escaped: escaped }.to_json(*a)
  end
end

# Monkey-patch this so that we get the name field in the serialized JSON, as
# well as information about whether or not we need to escape it.
class RBS::AST::Members::MethodDefinition
  def to_json(*a)
    {
      member: :method_definition,
      name: name,
      kind: kind,
      types: types,
      annotations: annotations,
      location: location,
      comment: comment,
      overload: overload
    }.to_json(*a)
  end
end

# Monkey-patch this so that we get the information we need about how to join the
# key-value pairs of the record.
class RBS::Types::Record
  def to_json(*a)
    fields_extra =
      fields.to_h do |key, type|
        if key.is_a?(Symbol) && key.match?(/\A[A-Za-z_][A-Za-z_]*\z/) &&
             !key.match?(RBS::Parser::KEYWORDS_RE)
          [key, { type: type, joiner: :label }]
        else
          [key.inspect, { type: type, joiner: :rocket }]
        end
      end

    { class: :record, fields: fields_extra, location: location }.to_json(*a)
  end
end

module Prettier
  class RBSParser
    def self.parse(text)
      { declarations: RBS::Parser.parse_signature(text) }
    rescue StandardError
      false
    end
  end
end

# If this is the main file we're executing, then most likely this is being
# executed from the parser.js spawn. In that case, read the rbs source from
# stdin and report back the AST over stdout.

if $0 == __FILE__
  response = Prettier::RBSParser.parse($stdin.read)

  if !response
    warn(
      '@prettier/plugin-ruby encountered an error when attempting to parse ' \
        'the RBS source. This usually means there was a syntax error in the ' \
        'file in question.'
    )

    exit 1
  end

  puts JSON.fast_generate(response)
end
