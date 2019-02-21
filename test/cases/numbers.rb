# frozen_string_literal: true

# rubocop:disable Metrics/MethodLength

class NumbersTest < Minitest::Test
  def test_positive_numbers
    assert_equal_to_s '123', 123
    assert_equal_to_s '-123', -123
    assert_equal_to_s '1123', 1_123
    assert_equal_to_s '-543', -543
    assert_equal_to_s '123456789123456789', 123_456_789_123_456_789
    assert_equal_to_s '123.45', 123.45
    assert_equal_to_s '0.0012', 1.2e-3
    assert_equal_to_s '43707', 0xaabb
    assert_equal_to_s '255', 0o377
    assert_equal_to_s '-10', -0b1010
    assert_equal_to_s '9', 0b001_001
  end

  private

  def assert_equal_to_s(expected, value)
    assert_equal expected.to_s, value.to_s
  end
end

# rubocop:enable Metrics/MethodLength
