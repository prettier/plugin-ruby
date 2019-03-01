# frozen_string_literal: true

class NextTest < Minitest::Test
  def test_no_args
    result = [1, 2, 3].map { next }

    assert_equal [nil, nil, nil], result
  end

  def test_one_arg_no_parens
    result = [1, 2, 3].map { next 1 }

    assert_equal [1, 1, 1], result
  end

  def test_one_arg_with_parens
    result = [1, 2, 3].map { next(1) }

    assert_equal [1, 1, 1], result
  end

  def test_multi_args_no_parens
    result = [1, 2, 3].map { next 1, 2 }

    assert_equal [[1, 2], [1, 2], [1, 2]], result
  end
end
