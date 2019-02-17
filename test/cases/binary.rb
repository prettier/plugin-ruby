# frozen_string_literal: true

class BinaryTest < Minitest::Test
  def test_unbroken
    value = true

    assert(value && value && value)
  end

  def test_broken
    super_super_super_super_super_long = true

    assert(
      super_super_super_super_super_long &&
        super_super_super_super_super_long &&
        super_super_super_super_super_long
    )
  end
end
