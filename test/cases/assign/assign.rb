# frozen_string_literal: true

# rubocop:disable Lint/UselessAssignment, Style/ParallelAssignment
# rubocop:disable Metrics/MethodLength
# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/LineLength

class AssignTest < Minitest::Test
  def test_assignment
    a = 1
    assert_equal 1, a

    a =
      begin
        2
      end
    assert_equal 2, a

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

    super_super_super_super_super_long = 'bar'
    super_super_super_long, super_super_super_long, super_super_super_long =
      super_super_super_super_super_long, super_super_super_super_super_long, super_super_super_super_super_long
    assert_equal super_super_super_long, 'bar'

    a = 2
    a ||= 1
    assert_equal 2, a

    a = 2
    a ||= super_super_super_super_super_super_super_super_super_super_super_super_long
    assert_equal 2, a

    super_super_super_super_super_super_super_super_super_super_super_super_long = 'foo'
    a = [
      super_super_super_super_super_super_super_super_super_super_super_long,
      super_super_super_super_super_super_super_super_super_super_super_long,
      super_super_super_super_super_super_super_super_super_super_super_long
    ]
    assert_equal ['foo', 'foo', 'foo'], a

    a = {
      a: super_super_super_super_super_super_super_super_super_super_long,
      b: super_super_super_super_super_super_super_super_super_super_long,
      c: super_super_super_super_super_super_super_super_super_super_long
    }
    assert_equal "{ a: 'foo', b: 'foo', c: 'foo' }", a.to_s

    # rubocop:disable Lint/UnneededCopDisableDirective
    # rubocop:disable Layout/MultilineMethodCallIndentation
    # I know, I know
    super_super_super_super_long = 'baz'
    a = [
      super_super_super_super_long,
      super_super_super_super_long
    ].sort
    assert_equal ['baz', 'baz'], a

    a = {
      a: super_super_super_super_long,
      b: super_super_super_super_long
    }.sort
    assert_equal "{ a: 'baz', b: 'baz' }", a
    # rubocop:enable Layout/MultilineMethodCallIndentation
    # rubocop:enable Lint/UnneededCopDisableDirective

  end
end

a.a = 1

super_super_super_long.super_super_super_super_super_super_super_long =
  super_super_super_super_super_super_super_super_super_super_super_long

# rubocop:enable Lint/UselessAssignment, Style/ParallelAssignment
# rubocop:enable Metrics/MethodLength
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/LineLength
