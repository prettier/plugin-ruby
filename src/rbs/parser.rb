#!/usr/bin/env ruby

begin
  require 'rbs'
rescue LoadError
  # If we can't load the rbs gem, then we're going to provide a shim parser that
  # will warn and bail out.
  class Prettier::RBSParser
    def self.parse(text)
      warn(
        'The `rbs` gem could not be loaded. Please ensure you have it ' \
          'installed and that it is available in the gem path.'
      )

      false
    end
  end

  return
end

# This was removed at some point, so we need to support both versions.
RBS::KEYWORD_RAW =
  if RBS::Parser.const_defined?(:KEYWORDS_RE)
    RBS::Parser::KEYWORDS_RE
  else
    RBS::Parser::KEYWORDS.keys.join('|')
  end

# This enforces that the full matched string is a keyword.
RBS::KEYWORD_FULL = /\A#{RBS::KEYWORD_RAW}\z/

# Monkey-patch this so that we can get the character positions.
class RBS::Location
  def to_json(*args)
    {
      start: {
        line: start_line,
        column: start_column
      },
      end: {
        line: end_line,
        column: end_column
      },
      start_pos: start_pos,
      end_pos: end_pos
    }.to_json(*args)
  end
end

# Monkey-patch this so that we get whether or not it needs to be escaped.
class RBS::Types::Function::Param
  def to_json(*a)
    escaped = name && RBS::KEYWORD_FULL.match?(name)

    # More modern versions of RBS just include the ` in the name so there's no
    # need to escape it further.
    escaped = false if name.to_s.start_with?('`')

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
    fields_extra = {}

    # Explicitly not using Enumerable#to_h here to support Ruby 2.5
    fields.each do |key, type|
      if key.is_a?(Symbol) && key.match?(/\A[A-Za-z_][A-Za-z_]*\z/) &&
           !key.match?(RBS::KEYWORD_RAW)
        fields_extra[key] = { type: type, joiner: :label }
      else
        fields_extra[key.inspect] = { type: type, joiner: :rocket }
      end
    end

    { class: :record, fields: fields_extra, location: location }.to_json(*a)
  end
end

if defined?(RBS::AST::Declarations::ModuleTypeParams)
  # This class was removed in rbs 2.0. Monkeypatch < 2.0 to give the same json
  # output
  class RBS::AST::Declarations::ModuleTypeParams
    def to_json(*a)
      params.to_json(*a)
    end
  end

  # make this look like the new AST::TypeParam json
  class RBS::AST::Declarations::ModuleTypeParams::TypeParam
    def to_json(*a)
      { name: name, variance: variance, unchecked: skip_validation }.to_json(*a)
    end
  end

  # https://github.com/ruby/rbs/commit/3ccdcb1f3ac5dcb866280f745866a852658195e6
  class RBS::MethodType
    # promote the array of symbols into TypeParam looking-things
    def to_json(*a)
      type_param_objects =
        type_params.map do |name|
          {
            name: name,
            variance: 'invariant',
            unchecked: 'false',
            upper_bound: nil
            # location - harder to get this but not needed
          }
        end

      {
        type_params: type_param_objects,
        type: type,
        block: block,
        location: location
      }.to_json(*a)
    end
  end
end

# The main parser interface.
module Prettier
  class RBSParser
    def self.parse(text)
      {
        declarations: RBS::Parser.parse_signature(text),
        location: {
          start_pos: 0,
          end_pos: text.length
        }
      }
    end
  end
end
