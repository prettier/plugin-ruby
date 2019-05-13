# frozen_string_literal: true

require 'test_helper'
require_relative '../../src/ripper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata <<~RUBY
      BEGIN {
      }
    RUBY
  end

  def test_END
    assert_metadata <<~RUBY
      END {
      }
    RUBY
  end

  def test_begin
    assert_metadata <<~RUBY
      begin
        begin; end
      end
    RUBY
  end

  def test_case
    assert_metadata <<~RUBY
      case foo
      when bar
        case baz
        when qux
        end
      end
    RUBY
  end

  def test_class
    assert_metadata <<~RUBY
      class Foo
        class Bar; end
      end
    RUBY
  end

  def test_def
    assert_metadata <<~RUBY
      def foo
        def bar; end
      end
    RUBY
  end

  def test_defined
    assert_metadata <<~RUBY
      defined?(
        Foo
      )
    RUBY
  end

  def test_defs
    assert_metadata <<~RUBY
      def Object.foo
        def Object.bar; end
      end
    RUBY
  end

  def test_else
    content = <<~RUBY
      if foo
        bar
      else
        baz
      end
    RUBY

    assert_node_metadata(
      parse(content).dig(:body, 2),
      # char_start: 13,
      char_end: 27
    )
  end

  def test_elsif
    content = <<~RUBY
      if foo
        bar
      elsif bar
        qux
      end
    RUBY

    assert_node_metadata(
      parse(content).dig(:body, 2),
      # char_start: 13,
      char_end: 32
    )
  end

  def test_ensure
    content = <<~RUBY
      begin
        foo
      ensure
        bar
      end
    RUBY

    assert_node_metadata(
      parse(content).dig(:body, 0, :body, 3),
      # char_start: 12,
      char_end: 28
    )
  end

  def test_for
    assert_metadata <<~RUBY
      for foo in bar do
        for baz in qux do
        end
      end
    RUBY
  end

  def test_if
    assert_metadata <<~RUBY
      if foo
        if bar; end
      end
    RUBY
  end

  def test_module
    assert_metadata <<~RUBY
      module Foo
        module Bar; end
      end
    RUBY
  end

  def test_sclass
    assert_metadata <<~RUBY
      class << Foo
        class << Bar; end
      end
    RUBY
  end

  def test_unless
    assert_metadata <<~RUBY
      unless foo
        unless bar; end
      end
    RUBY
  end

  def test_until
    assert_metadata <<~RUBY
      until foo
        until bar; end
      end
    RUBY
  end

  def test_while
    assert_metadata <<~RUBY
      while foo
        while bar; end
      end
    RUBY
  end

  private

  def assert_metadata(ruby)
    assert_node_metadata(
      parse(ruby),
      # char_start: 0,
      char_end: ruby.length - 1
    )
  end

  def assert_node_metadata(node, metadata)
    metadata.each do |key, value|
      assert_equal value, node[key]
    end
  end

  def parse(ruby)
    RipperJS.parse(ruby).dig(:body, 0, :body, 0)
  end
end
