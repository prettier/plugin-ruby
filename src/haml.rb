#!/usr/bin/env ruby

require 'json'
require 'haml'

class Haml::Parser::ParseNode
  def as_json
    case type
    when :doctype, :plain, :script, :silent_script
      to_h.tap do |json|
        json.delete(:parent)
        json[:children] = children.map(&:as_json)
      end
    when :root
      to_h.tap do |json|
        json[:children] = children.map(&:as_json)
      end
    when :tag
      to_h.tap do |json|
        json.delete(:parent)
        json.merge!(
          children: children.map(&:as_json),
          value: value.merge(dynamic_attributes: value[:dynamic_attributes].to_h)
        )
      end
    else
      raise ArgumentError, "Unsupported type: #{type}"
    end
  end

  def self.to_json(template)
    parser = Haml::Parser.new({})
    JSON.fast_generate(parser.call(template).as_json)
  end
end

# If this is the main file we're executing, then most likely this is being
# executed from the haml.js spawn. In that case, read the ruby source from
# stdin and report back the AST over stdout.

if $0 == __FILE__
  parser = Haml::Parser.new({})
  template = $stdin.read

  puts JSON.fast_generate(parser.call(template).as_json)
end
