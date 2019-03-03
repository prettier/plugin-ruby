# frozen_string_literal: true

require 'test_helper'

class PrettierTest < Minitest::Test
  def test_version
    refute_nil ::Prettier::VERSION
  end
end
