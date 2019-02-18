# frozen_string_literal: true

class KwargsTest < Minitest::Test
  def add(alpha:, beta:, gamma: 1, delta: 2)
    alpha + beta + gamma + delta
  end

  def test_kwargs
    assert_equal 10, add(alpha: 1, beta: 2, gamma: 3, delta: 4)

    args = { alpha: 1, beta: 2, gamma: 3 }
    assert_equal 10, add(**args, delta: 4)
  end
end
