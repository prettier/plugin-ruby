# frozen_string_literal: true

require 'test_helper'

class RBSTest < Minitest::Test
  # https://github.com/ruby/rbs/commit/c5da467adacc75fe9294ec1630f1b7931d9d6871
  def test_module_type_params_empty
    actual = declaration_json("interface _Foo\nend")['type_params']
    assert_instance_of Array, actual
    assert_empty actual
  end

  def test_module_type_params_fancy
    source = <<~SOURCE
      class Foo[unchecked in A, B]
      end
    SOURCE

    actual = declaration_json(source)['type_params']
    assert_instance_of Array, actual
    assert_equal 2, actual.length

    type_a, type_b = actual

    assert_equal 'A', type_a['name']
    assert_equal 'contravariant', type_a['variance']
    assert_equal true, type_a['unchecked']

    assert_equal 'B', type_b['name']
    assert_equal 'invariant', type_b['variance']
    assert_equal false, type_b['unchecked']
  end

  # https://github.com/ruby/rbs/commit/3ccdcb1f3ac5dcb866280f745866a852658195e6
  def test_generic_method
    source = <<~SOURCE
      class T
        def t: [A, B] (A) -> B
      end
    SOURCE

    actual = member_json(source)['types'].first['type_params']
    assert_equal 2, actual.length

    type_a, type_b = actual
    assert_equal 'A', type_a['name']
    assert_equal 'B', type_b['name']
  end

  private

  def declaration_json(source)
    JSON.parse(first_declaration(source).to_json)
  end

  def member_json(source)
    JSON.parse(first_member(source).to_json)
  end

  def parse(source)
    Prettier::RBSParser.parse(source)
  end

  def first_declaration(source)
    parse(source)[:declarations].first
  end

  def first_member(source)
    first_declaration(source).members.first
  end
end
