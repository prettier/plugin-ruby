# frozen_string_literal: true

# rubocop:disable Lint/UnusedMethodArgument
# rubocop:disable Lint/UselessAccessModifier
# rubocop:disable Style/AccessModifierDeclarations

class AccessModifiersTest < Minitest::Test
  def test_simple_modifiers
    instance = SimpleModifiers.new

    assert_includes instance.public_methods, :public_foo
    assert_includes instance.protected_methods, :protected_foo
    assert_includes instance.protected_methods, :protected_bar
    assert_includes instance.private_methods, :private_foo
  end

  def test_complex_modifiers
    instance = ComplexCommandModifiers.new

    assert_includes instance.public_methods, :public_custom_method_helper_prefix
    assert_includes instance.public_methods, :public_foo
    assert_includes instance.protected_methods, :protected_custom_method_helper_prefix
    assert_includes instance.protected_methods, :protected_foo
    assert_includes instance.private_methods, :private_foo
  end

  private

  class SimpleModifiers
    public
    def public_foo() end

    protected
    def protected_foo() end

    # testing
    protected # testing
    # testing
    def protected_bar() end

    private
    def private_foo() end
  end

  class ComplexCommandModifiers
    def self.custom_method_helper(method_name)
      method_name
    end

    custom_method_helper def public_custom_method_helper_prefix(arg)
      true
    end

    public def public_foo(arg)
      true
    end

    protected custom_method_helper def protected_custom_method_helper_prefix(arg)
      true
    end

    private def private_foo(_alpha: 'foobar', _beta: 'foobar', _gamma: 'foobar', _delta: 'foobar', _zeta: 'foobar')
      true
    end

    # rubocop:disable all
    protected def protected_foo _alpha: 'foobar', _beta: 'foobar', _gamma: 'foobar', _delta: 'foobar', _zeta: 'foobar'
      true
    end
    # rubocop:enable all
  end
end

# rubocop:enable Lint/UnusedMethodArgument
# rubocop:enable Lint/UselessAccessModifier
# rubocop:enable Style/AccessModifierDeclarations