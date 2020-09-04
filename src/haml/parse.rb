#!/usr/bin/env ruby

require 'bundler/setup' if ENV['CI']
require 'haml'

class Haml::Parser::ParseNode
  ESCAPE = /Haml::Helpers.html_escape\(\((.+)\)\)/.freeze

  # If a node comes in as the plain type but starts with one of the special
  # characters that haml parses, then we need to escape it with a \ when
  # printing. So here we make a regexp pattern to check if the node needs to be
  # escaped.
  special_chars =
    Haml::Parser::SPECIAL_CHARACTERS.map { |char| Regexp.escape(char) }

  SPECIAL_START = /\A(?:#{special_chars.join('|')})/

  def as_json
    case type
    when :comment, :doctype, :silent_script
      to_h.tap do |json|
        json.delete(:parent)
        json[:children] = children.map(&:as_json)
      end
    when :filter, :haml_comment
      to_h.tap { |json| json.delete(:parent) }
    when :plain
      to_h.tap do |json|
        json.delete(:parent)
        json[:children] = children.map(&:as_json)

        text = json[:value][:text]
        json[:value][:text] = "\\#{text}" if text.match?(SPECIAL_START)
      end
    when :root
      to_h.tap { |json| json[:children] = children.map(&:as_json) }
    when :script
      to_h.tap do |json|
        json.delete(:parent)
        json[:children] = children.map(&:as_json)

        if json[:value][:text].match?(ESCAPE)
          json[:value][:text].gsub!(ESCAPE) { $1 }
          json[:value].merge!(escape_html: 'escape_html', interpolate: true)
        end
      end
    when :tag
      to_h.tap do |json|
        json.delete(:parent)

        # For some reason this is actually using a symbol to represent a null
        # object ref instead of nil itself, so just replacing it here for
        # simplicity in the printer
        json[:value][:object_ref] = nil if json[:value][:object_ref] == :nil

        json.merge!(
          children: children.map(&:as_json),
          value:
            value.merge(dynamic_attributes: value[:dynamic_attributes].to_h)
        )
      end
    else
      raise ArgumentError, "Unsupported type: #{type}"
    end
  end
end

# If this is the main file we're executing, then most likely this is being
# executed from the haml.js spawn. In that case, read the ruby source from
# stdin and report back the AST over stdout.
if $0 == __FILE__
  # Don't explicitly require JSON if there is already as JSON loaded, as this
  # can lead to all kinds of trouble where one version of it was already
  # "activated" by rubygems.
  require 'json' unless defined?(JSON)

  parser = Haml::Parser.new({})
  template = $stdin.read

  puts JSON.fast_generate(parser.call(template).as_json)
end
