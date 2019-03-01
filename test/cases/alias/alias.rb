# frozen_string_literal: true

# rubocop:disable Style/GlobalVars
class AliasTest < Minitest::Test
  def test_plain_alias
    assert_equal 'plain alias', foo
  end

  def test_global_alias
    $bar = 'global alias'
    assert_equal 'global alias', $foo
  end

  private

  def baz
    'plain alias'
  end

  alias bar baz # inline comment
  alias :foo :bar
  alias $foo $bar
end
# rubocop:enable Style/GlobalVars
