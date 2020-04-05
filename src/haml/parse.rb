#!/usr/bin/env ruby

require 'bundler/setup' if ENV['CI']
require 'haml'

class Haml::Parser::ParseNode
  ESCAPE = /Haml::Helpers.html_escape\(\((.+)\)\)/.freeze

  def as_json
    case type
    when :comment, :doctype, :plain, :silent_script
      to_h.tap do |json|
        json.delete(:parent)
        json[:children] = children.map(&:as_json)
      end
    when :filter, :haml_comment
      to_h.tap { |json| json.delete(:parent) }
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
