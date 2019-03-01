# frozen_string_literal: true

class RegexpTest < Minitest::Test
  def test_default
    regexp = /abc/

    assert_match regexp, 'abcde'
  end

  def test_braces
    regexp = %r{abc}

    assert_match regexp, 'abcde'
  end

  def test_braces_with_slashes
    regexp = %r{a/b/c}

    assert_match regexp, 'a/b/c/d/e'
  end

  def test_slashes
    regexp = %r/abc/

    assert_match regexp, 'abcde'
  end

  def test_brackets
    regexp = %r[abc]

    assert_match regexp, 'abcde'
  end

  def test_parens
    regexp = %r(abc)

    assert_match regexp, 'abcde'
  end

  def test_interpolation
    inter = 'b'
    regexp = /a#{inter}c/

    assert_match regexp, 'abcde'
  end

  def test_modifier
    regexp = /abc/i

    assert_match regexp, 'ABCDE'
  end

  def test_brace_modifier
    regexp = %r{abc}i

    assert_match regexp, 'ABCDE'
  end

  def test_global_interpolation
    'foo' =~ /foo/
    regexp = /#$&/

    assert_match regexp, 'foobar'
  end

  def test_float
    float_pat = /\A
      [[:digit:]]+ # 1 or more digits before the decimal point
      (\.          # Decimal point
          [[:digit:]]+ # 1 or more digits after the decimal point
      )? # The decimal point and following digits are optional
    \Z/x

    assert_match float_pat, "12.56"
  end
end
