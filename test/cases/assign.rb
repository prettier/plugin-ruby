# frozen_string_literal: true

# rubocop:disable Lint/UselessAssignment, Style/ParallelAssignment
# rubocop:disable Metrics/MethodLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/LineLength
# rubocop:disable Metrics/ClassLength

class AssignTest < Minitest::Test
  def test_assignment
    a = 1
    assert_equal 1, a

    a =
      begin
        2
      end
    assert_equal 2, a
  end

  def test_parallel_assignment
    a, b, c = [1, 2, 3]
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c

    a = 1, 2, 3
    assert_equal [1, 2, 3], a

    a, b, c = 1, 2, 3
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c

    (a, b, c) = 1, 2, 3
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c

    ((a, b, c)) = 1, 2, 3
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c

    (((a, b, c))) = 1, 2, 3
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c
  end

  def test_assign_with_splat_operator
    a, *b = 1, 2, 3
    assert_equal 1, a
    assert_equal [2, 3], b

    a, *b, c, d = 1, 2, 3
    assert_equal 1, a
    assert_equal [], b
    assert_equal 2, c
    assert_equal 3, d

    a, * = 1, 2, 3
    assert_equal 1, a

    a = *a
    assert_equal [1], a

    (a, b), c = [1, 2], 3
    assert_equal 1, a
    assert_equal 2, b
    assert_equal 3, c

    * = [1, 2, 3]

    *, a = [1, 2, 3]
    assert_equal 3, a
  end

  def test_or_equals_operator
    a = 2
    a ||= 1
    assert_equal 2, a
  end

  def test_long_variable_assignment
    super_super_super_super_super_long = 'bar'
    super_super_super_long, super_super_super_long, super_super_super_long =
      super_super_super_super_super_long, super_super_super_super_super_long, super_super_super_super_super_long
    assert_equal super_super_super_long, 'bar'

    a = 2
    a ||= super_super_super_super_super_super_super_super_super_super_super_super_long
    assert_equal 2, a

    super_super_super_super_super_super_super_super_super_super_super_long = 'foo'
    a = [
      super_super_super_super_super_super_super_super_super_super_super_long,
      super_super_super_super_super_super_super_super_super_super_super_long,
      super_super_super_super_super_super_super_super_super_super_super_long
    ]

    assert_equal ['foo', 'foo', 'foo'], a
  end

  def test_assign_hash
    super_super_super_super_super_super_super_super_super_super_long = 'foo'

    hash = {
      a: super_super_super_super_super_super_super_super_super_super_long,
      b: super_super_super_super_super_super_super_super_super_super_long,
      c: super_super_super_super_super_super_super_super_super_super_long
    }

    assert_equal({ a: 'foo', b: 'foo', c: 'foo' }, hash)
  end

  def test_assign_with_sort
    # rubocop:disable Lint/UnneededCopDisableDirective
    # rubocop:disable Layout/MultilineMethodCallIndentation
    super_super_super_super_long = 'baz'

    arr = [super_super_super_super_long, super_super_super_super_long].sort
    assert_equal ['baz', 'baz'], arr

    arr = { a: super_super_super_super_long, b: super_super_super_super_long }.sort.to_h
    assert_equal({ a: 'baz', b: 'baz' }, arr)

    # rubocop:enable Layout/MultilineMethodCallIndentation
    # rubocop:enable Lint/UnneededCopDisableDirective
  end

  def test_setter_methods
    a = Struct.new(:a).new

    a.a = 1
    assert_equal 1, a.a

    super_super_super_long =
      Struct.new(:super_super_super_super_super_super_super_long).new

    super_super_super_super_super_super_super_super_super_super_super_long = 1

    super_super_super_long.super_super_super_super_super_super_super_long =
      super_super_super_super_super_super_super_super_super_super_super_long

    assert_equal(
      super_super_super_long.super_super_super_super_super_super_super_long,
      1
    )
  end
end

# rubocop:enable Lint/UselessAssignment, Style/ParallelAssignment
# rubocop:enable Metrics/MethodLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/LineLength
# rubocop:enable Metrics/ClassLength