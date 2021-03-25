# frozen_string_literal: true

require 'ripper'

begin
  require 'haml'
rescue LoadError
  # If we can't load the haml gem, then we're going to provide a shim parser
  # that will warn and bail out.
  class Prettier::HAMLParser
    def self.parse(text)
      warn(
        'The `haml` gem could not be loaded. Please ensure you have it ' \
          'installed and that it is available in the gem path.'
      )

      false
    end
  end

  return
end

class Haml::Parser::ParseNode
  class DeepAttributeParser
    def parse(string)
      Haml::AttributeParser.available? ? parse_value(string) : string
    end

    private

    def literal(string, level)
      level == 0 ? string : "&#{string}"
    end

    def parse_value(string, level = 0)
      response = Ripper.sexp(string)
      return literal(string, level) unless response

      case response[1][0][0]
      when :hash
        hash = Haml::AttributeParser.parse(string)

        if hash
          # Explicitly not using Enumerable#to_h here to support Ruby 2.5
          hash.each_with_object({}) do |(key, value), response|
            response[key] = parse_value(value, level + 1)
          end
        else
          literal(string, level)
        end
      when :string_literal
        string[1...-1]
      else
        literal(string, level)
      end
    end
  end

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
      to_h.tap do |json|
        json[:children] = children.map(&:as_json)

        # We need this information in the printer to know how to lay out
        # multi-line attributes.
        json[:supports_multiline] =
          Gem::Version.new(Haml::VERSION) >= Gem::Version.new('5.2')
      end
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

        # Get a reference to the dynamic attributes hash
        dynamic_attributes = value[:dynamic_attributes].to_h

        # If we have any in the old style, then we're going to pass it through
        # the deep attribute parser filter.
        if dynamic_attributes[:old]
          dynamic_attributes[:old] =
            DeepAttributeParser.new.parse(dynamic_attributes[:old])
        end

        json.merge!(
          children: children.map(&:as_json),
          value: value.merge(dynamic_attributes: dynamic_attributes)
        )
      end
    else
      raise ArgumentError, "Unsupported type: #{type}"
    end
  end
end

module Prettier
  class HAMLParser
    def self.parse(source)
      Haml::Parser.new({}).call(source).as_json
    end
  end
end
