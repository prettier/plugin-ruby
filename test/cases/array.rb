# frozen_string_literal: true

# rubocop:disable Metrics/LineLength
# rubocop:disable Metrics/MethodLength

class ArrayTest < Minitest::Test
  def test_array
    assert_equal_join "", []
    assert_equal_join "1, 2, 3", [1, 2, 3]
    assert_equal_join "a, b, c", ['a', 'b', 'c']
    assert_equal_join "a, b c, d", ['a', 'b c', 'd']
    assert_equal_join "a, b, c", [:a, :b, :c]
    assert_equal_join "a, b c, d", [:a, :"b c", :d]
  end

  def test_array_with_general_delimited_syntax
    foo = 'foo'
    bar = 'bar'
    baz = 'baz'
    assert_equal_join "a, b, c", %w[a b c]
    assert_equal_join "a, b, c", %i[a b c]
    assert_equal_join "afooa, bbarb, cbazc", %W[a#{foo}a b#{bar}b c#{baz}c]
    assert_equal_join "afooa, bbarb, cbazc", %I[a#{foo}a b#{bar}b c#{baz}c]
  end

  def test_array_with_splat_operator
    # rubocop:disable Lint/UnneededSplatExpansion
    assert_equal_join "1, 2, 3, 4, 5, 6", [1, 2, *[3, 4], 5, 6]
    # rubocop:enable Lint/UnneededSplatExpansion
  end

  def test_array_with_long_elements
    super_super_super_super_super_super_super_super_super_super_super_long =
      'foo'
    assert_equal_join(
      "foo, foo, foo, foo",
      [
        super_super_super_super_super_super_super_super_super_super_super_long,
        super_super_super_super_super_super_super_super_super_super_super_long, [
          super_super_super_super_super_super_super_super_super_super_super_long,
          super_super_super_super_super_super_super_super_super_super_super_long
        ]
      ]
    )
  end

  def test_array_assignment
    a = ["foo", "bar"]

    assert_equal_to_s "bar", a[1]

    a[1] = "baz"

    assert_equal_to_s "baz", a[1]

    super_super_super_super_super_super_super_super_super_super_super_super_long_zero = 0
    super_super_super_super_super_super_super_super_super_super_super_super_long_baz = 'baz'

    assert_equal_to_s(
      "foo",
      a[super_super_super_super_super_super_super_super_super_super_super_super_long_zero]
    )

    a[1] = [
      super_super_super_super_super_super_super_super_super_super_super_super_long_baz,
      super_super_super_super_super_super_super_super_super_super_super_super_long_baz
    ]

    assert_equal_join "baz, baz", a[1]

    a[1] = [
      # abc
      %w[abc]
    ]

    assert_equal_join "abc", a[1]
  end

  private

  def assert_equal_join(expected, object)
    assert_equal expected, object.join(', ')
  end

  def assert_equal_to_s(expected, object)
    assert_equal expected, object.to_s
  end
end

# rubocop:enable Metrics/LineLength
# rubocop:enable Metrics/MethodLength
