# frozen_string_literal: true

require 'test_helper'

class UtilsTest < Minitest::Test
  def test_compatible_ruby_version
    assert Prettier::PluginRuby::Utils.compatible_ruby_version?('2.5.0')
  end

  def test_incompatible_ruby_version
    refute Prettier::PluginRuby::Utils.compatible_ruby_version?('2.4.0')
  end
end
