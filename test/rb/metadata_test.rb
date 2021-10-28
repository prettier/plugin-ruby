# frozen_string_literal: true

require 'test_helper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata :BEGIN, <<~SOURCE
      BEGIN {
      }
    SOURCE
  end

  def test_END
    assert_metadata :END, <<~SOURCE
      END {
      }
    SOURCE
  end

  def test_alias
    assert_metadata :alias, 'alias foo bar'
  end

  def test_array_args
    assert_metadata :array, <<~SOURCE
      [
        foo,
        bar,
        baz
      ]
    SOURCE
  end

  def test_array_args_add_star
    assert_metadata :array, <<~SOURCE
      [
        foo,
        *bar,
        baz
      ]
    SOURCE
  end

  def test_array_qwords
    assert_metadata :array, <<~SOURCE
      %w[
        foo
        bar
        baz
      ]
    SOURCE
  end

  def test_aref
    assert_metadata :aref, 'foo[bar]'
  end

  def test_aref_field
    assert_node_metadata(
      :aref_field,
      parse('foo[bar] = baz').dig(:body, 0),
      start_char: 0,
      end_char: 8
    )
  end

  def test_args
    assert_node_metadata(
      :args,
      parse('foo bar, baz').dig(:body, 1, :body, 0),
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_block
    assert_node_metadata(
      :args_add_block,
      parse('foo bar, baz').dig(:body, 1),
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_star
    assert_node_metadata(
      :args_add_star,
      parse('foo *bar').dig(:body, 1, :body, 0),
      start_char: 4,
      end_char: 8
    )
  end

  def test_arg_paren
    content = <<~SOURCE
      foo(
        a,
        b,
        c
      )
    SOURCE

    assert_node_metadata(
      :arg_paren,
      parse(content).dig(:body, 1),
      start_char: 3,
      end_char: 20,
      start_line: 1,
      end_line: 5
    )
  end

  def test_assign
    assert_metadata :assign, 'foo = bar'
  end

  def test_assoc_new
    assert_node_metadata(
      :assoc_new,
      parse('{ foo: bar, bar: baz }').dig(:body, 0, :body, 0),
      start_char: 2,
      end_char: 10
    )
  end

  def test_assoc_splat
    assert_node_metadata(
      :assoc_splat,
      parse('foo **bar').dig(:body, 1, :body, 0, :body, 0, :body, 0),
      start_char: 4,
      end_char: 9
    )
  end

  def test_assoclist_from_args
    assert_node_metadata(
      :assoclist_from_args,
      parse('{ foo => bar }').dig(:body, 0),
      start_char: 1,
      end_char: 13
    )
  end

  def test_bare_assoc_hash
    assert_node_metadata(
      :bare_assoc_hash,
      parse('foo(bar: baz)').dig(:body, 1, :body, 0, :body, 0, :body, 0),
      start_char: 4,
      end_char: 12
    )
  end

  def test_begin
    assert_metadata :begin, <<~SOURCE
      begin
        begin; end
      end
    SOURCE
  end

  def test_binary
    assert_metadata :binary, 'foo + bar'
  end

  def test_blockarg
    assert_node_metadata(
      :blockarg,
      parse('def foo(&bar) end').dig(:body, 1, :body, 0, :body, 6),
      start_char: 8,
      end_char: 12
    )
  end

  def test_block_var
    assert_node_metadata(
      :block_var,
      parse('foo { |bar| }').dig(:body, 1, :body, 0),
      start_char: 6,
      end_char: 11
    )
  end

  def test_bodystmt
    assert_node_metadata(
      :bodystmt,
      parse('class Foo; def foo; end; end').dig(:body, 2),
      start_char: 9,
      end_char: 25
    )
  end

  def test_brace_block
    assert_node_metadata(
      :brace_block,
      parse('foo { bar }').dig(:body, 1),
      start_char: 4,
      end_char: 11
    )
  end

  def test_break
    assert_metadata :break, 'break foo'
  end

  def test_call
    assert_metadata :call, 'foo.bar'
  end

  def test_case
    assert_metadata :case, <<~SOURCE
      case foo
      when bar
        case baz
        when qux
        end
      end
    SOURCE
  end

  def test_class
    assert_metadata :class, <<~SOURCE
      class Foo
        class Bar; end
      end
    SOURCE
  end

  def test_command
    assert_metadata :command, 'foo bar'
  end

  def test_command_call
    assert_metadata :command_call, 'foo.bar baz'
  end

  def test_const_ref
    assert_node_metadata(
      :const_ref,
      parse('class Foo; end').dig(:body, 0),
      start_char: 6,
      end_char: 9
    )
  end

  def test_const_path_field
    assert_node_metadata(
      :const_path_field,
      parse('Foo::Bar = baz').dig(:body, 0),
      start_char: 0,
      end_char: 8
    )
  end

  def test_const_path_ref
    assert_metadata :const_path_ref, 'Foo::Bar'
  end

  def test_def
    assert_metadata :def, <<~SOURCE
      def foo
        def bar; end
      end
    SOURCE
  end

  def test_defined
    assert_metadata :defined, <<~SOURCE
      defined?(
        Foo
      )
    SOURCE
  end

  def test_defs
    assert_metadata :defs, <<~SOURCE
      def Object.foo
        def Object.bar; end
      end
    SOURCE
  end

  def test_do_block
    assert_node_metadata(
      :do_block,
      parse('foo do; bar; end').dig(:body, 1),
      start_char: 4,
      end_char: 16
    )
  end

  def test_dot2
    assert_metadata :dot2, 'foo..bar'
  end

  def test_dot3
    assert_metadata :dot3, 'foo...bar'
  end

  def test_dyna_symbol
    assert_metadata :dyna_symbol, ':"foo #{bar} baz"'
  end

  def test_else
    content = <<~SOURCE
      if foo
        bar
      else
        baz
      end
    SOURCE

    assert_node_metadata(
      :else,
      parse(content).dig(:body, 2),
      start_char: 13,
      end_char: 27,
      start_line: 3,
      end_line: 5
    )
  end

  def test_elsif
    content = <<~SOURCE
      if foo
        bar
      elsif bar
        qux
      end
    SOURCE

    assert_node_metadata(
      :elsif,
      parse(content).dig(:body, 2),
      start_char: 13,
      end_char: 32,
      start_line: 3,
      end_line: 5
    )
  end

  def test_ensure
    content = <<~SOURCE
      begin
        foo
      ensure
        bar
      end
    SOURCE

    assert_node_metadata(
      :ensure,
      parse(content).dig(:body, 0, :body, 3),
      start_char: 12,
      end_char: 28,
      start_line: 3,
      end_line: 5
    )
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.6')
    def test_excessed_comma
      assert_node_metadata(
        :excessed_comma,
        parse('foo { |bar,| }').dig(:body, 1, :body, 0, :body, 0, :body, 2),
        start_char: 10,
        end_char: 11
      )
    end
  end

  def test_fcall
    assert_node_metadata(
      :fcall,
      parse('foo(bar)').dig(:body, 0),
      start_char: 0,
      end_char: 3
    )
  end

  def test_field
    assert_node_metadata(
      :field,
      parse('foo.bar = baz').dig(:body, 0),
      start_char: 0,
      end_char: 7
    )
  end

  def test_for
    assert_metadata :for, <<~SOURCE
      for foo in bar do
        for baz in qux do
        end
      end
    SOURCE
  end

  def test_hash
    assert_metadata :hash, <<~SOURCE
      {
        foo: 'bar'
      }
    SOURCE
  end

  def test_if
    assert_metadata :if, <<~SOURCE
      if foo
        if bar; end
      end
    SOURCE
  end

  def test_ifop
    assert_metadata :ifop, 'foo ? bar : baz'
  end

  def test_if_mod
    assert_metadata :if_mod, 'foo if bar'
  end

  def test_kwrest_param
    assert_node_metadata(
      :kwrest_param,
      parse('def foo(**bar); end').dig(:body, 1, :body, 0, :body, 5),
      start_char: 8,
      end_char: 13
    )
  end

  def test_lambda
    assert_metadata :lambda, <<~SOURCE
      -> (foo, bar) {
        foo + bar
      }
    SOURCE
  end

  def test_massign
    assert_metadata :massign, 'foo, bar, baz = 1, 2, 3'
  end

  def test_method_add_arg
    assert_metadata :method_add_arg, 'foo(bar)'
  end

  def test_method_add_block
    assert_metadata :method_add_block, 'foo { bar }'
  end

  def test_mlhs
    assert_node_metadata(
      :mlhs,
      parse('foo, bar, baz = 1, 2, 3').dig(:body, 0),
      start_char: 0,
      end_char: 13
    )
  end

  def test_mlhs_add_post
    assert_node_metadata(
      :mlhs_add_post,
      parse('foo, *bar, baz = 1, 2, 3').dig(:body, 0),
      start_char: 5,
      end_char: 14
    )
  end

  def test_mlhs_add_star
    assert_node_metadata(
      :mlhs_add_star,
      parse('foo, *bar = 1, 2, 3').dig(:body, 0),
      start_char: 5,
      end_char: 9
    )
  end

  def test_mlhs_paren
    assert_node_metadata(
      :mlhs_paren,
      parse('(foo, bar) = baz').dig(:body, 0),
      start_char: 0,
      end_char: 10
    )
  end

  def test_module
    assert_metadata :module, <<~SOURCE
      module Foo
        module Bar; end
      end
    SOURCE
  end

  def test_mrhs_add_star
    assert_node_metadata(
      :mrhs_add_star,
      parse('foo, bar = *baz').dig(:body, 1),
      start_char: 11,
      end_char: 15
    )
  end

  def test_mrhs_new_from_args
    assert_node_metadata(
      :mrhs_new_from_args,
      parse('foo, bar, baz = 1, 2, 3').dig(:body, 1),
      start_char: 16,
      end_char: 23
    )
  end

  def test_next
    assert_metadata :next, 'next foo'
  end

  def test_opassign
    assert_metadata :opassign, 'foo ||= bar'
  end

  def test_params
    content = <<~SOURCE
      def foo(
        bar,
        baz
      ); end
    SOURCE

    assert_node_metadata(
      :params,
      parse(content).dig(:body, 1, :body, 0),
      start_char: 8,
      end_char: 22,
      start_line: 2,
      end_line: 3
    )
  end

  def test_paren
    assert_metadata :paren, '()'
  end

  def test_qsymbols
    assert_node_metadata(
      :qsymbols,
      parse('%i[foo bar baz]').dig(:body, 0),
      start_char: 0,
      end_char: 15
    )
  end

  def test_qwords
    assert_node_metadata(
      :qwords,
      parse('%w[foo bar baz]').dig(:body, 0),
      start_char: 0,
      end_char: 15
    )
  end

  def test_redo
    assert_metadata :redo, 'redo'
  end

  def test_regexp_literal
    assert_metadata :regexp_literal, '/foo/'
    assert_metadata :regexp_literal, '%r{foo}'
    assert_metadata :regexp_literal, '%r(foo)'

    assert_node_metadata(
      :regexp_literal,
      parse('%r(foo)'),
      beging: '%r(',
      ending: ')',
      start_char: 0,
      end_char: 7
    )
  end

  def test_rescue
    assert_node_metadata(
      :rescue,
      parse('begin; foo; rescue => bar; baz; end').dig(:body, 0, :body, 1),
      start_char: 12,
      end_char: 35
    )
  end

  def test_rescue_mod
    assert_metadata :rescue_mod, 'foo rescue bar'
  end

  def test_rest_param
    assert_node_metadata(
      :rest_param,
      parse('def foo(*bar); end').dig(:body, 1, :body, 0, :body, 2),
      start_char: 8,
      end_char: 12
    )
  end

  def test_retry
    assert_metadata :retry, 'retry'
  end

  def test_return
    assert_metadata :return, 'return foo'
  end

  def test_return0
    assert_metadata :return0, 'return'
  end

  def test_sclass
    assert_metadata :sclass, <<~SOURCE
      class << Foo
        class << Bar; end
      end
    SOURCE
  end

  def test_string_concat
    assert_metadata :string_concat, <<~SOURCE
      'foo' \
        'bar'
    SOURCE
  end

  def test_string_dvar
    assert_node_metadata(
      :string_dvar,
      parse('"#$foo"').dig(:body, 0),
      start_char: 1,
      end_char: 6
    )
  end

  def test_string_embexpr
    assert_node_metadata(
      :string_embexpr,
      parse('"foo #{bar} baz"').dig(:body, 1),
      start_char: 5,
      end_char: 11
    )
  end

  def test_string_literal
    assert_metadata :string_literal, '"foo"'
  end

  def test_super
    assert_metadata :super, 'super foo'
  end

  def test_symbol_literal
    assert_metadata :symbol_literal, ':foo'
  end

  def test_symbols
    assert_node_metadata(
      :symbols,
      parse('%I[f#{o}o b#{a}r b#{a}z]').dig(:body, 0),
      start_char: 0,
      end_char: 24
    )
  end

  def test_top_const_field
    assert_node_metadata(
      :top_const_field,
      parse('::Foo = bar').dig(:body, 0),
      start_char: 0,
      end_char: 5
    )
  end

  def test_top_const_ref
    assert_metadata :top_const_ref, '::Foo'
  end

  def test_unary
    assert_metadata :unary, '-foo'
    assert_metadata :unary, 'not foo'
  end

  def test_undef
    assert_metadata :undef, 'undef foo, bar'
  end

  def test_unless
    assert_metadata :unless, <<~SOURCE
      unless foo
        unless bar; end
      end
    SOURCE
  end

  def test_unless_mod
    assert_metadata :unless_mod, 'foo unless bar'
  end

  def test_until
    assert_metadata :until, <<~SOURCE
      until foo
        until bar; end
      end
    SOURCE
  end

  def test_until_mod
    assert_metadata :until_mod, 'foo until bar'
  end

  def test_while
    assert_metadata :while, <<~SOURCE
      while foo
        while bar; end
      end
    SOURCE
  end

  def test_var_alias
    assert_metadata :var_alias, 'alias $foo $bar'
  end

  def test_var_field
    assert_node_metadata(
      :var_field,
      parse('foo = 1').dig(:body, 0),
      start_char: 0,
      end_char: 3
    )
  end

  def test_var_ref
    assert_metadata :var_ref, 'true'
  end

  def test_vcall
    assert_metadata :vcall, 'foo'
  end

  def test_void_stmt
    assert_node_metadata(:void_stmt, parse('; ;'), start_char: 0, end_char: 0)
  end

  def test_when
    assert_node_metadata(
      :when,
      parse('case foo; when bar; baz; end').dig(:body, 1),
      start_char: 10,
      end_char: 28
    )
  end

  def test_while_mod
    assert_metadata :while_mod, 'foo while bar'
  end

  def test_words
    assert_node_metadata(
      :words,
      parse('%W[f#{o}o b#{a}r b#{a}z]').dig(:body, 0),
      start_char: 0,
      end_char: 24
    )
  end

  def test_xstring
    assert_metadata :xstring_literal, <<~SOURCE
      `
        foo
        bar
      `
    SOURCE
  end

  def test_yield
    assert_metadata :yield, 'yield foo'
  end

  def test_yield0
    assert_metadata :yield0, 'yield'
  end

  def test_zsuper
    assert_metadata :zsuper, 'super'
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.7')
    def test_args_forward
      content = <<~SOURCE
        def foo(...)
          bar(...)
        end
      SOURCE

      assert_node_metadata(
        :args_forward,
        parse(content).dig(:body, 1, :body, 0, :body, 2),
        start_char: 8,
        end_char: 11
      )
    end

    def test_aryptn
      content = <<~SOURCE
        case foo
        in bar, baz
          qux
        end
      SOURCE

      assert_node_metadata(
        :aryptn,
        parse(content).dig(:body, 1, :body, 0),
        start_char: 12,
        end_char: 20,
        start_line: 2,
        end_line: 2
      )
    end

    def test_in
      content = <<~SOURCE
        case foo
        in bar
          baz
        end
      SOURCE

      assert_node_metadata(
        :in,
        parse(content).dig(:body, 1),
        start_char: 9,
        end_char: 25,
        start_line: 2,
        end_line: 4
      )
    end
  end

  private

  def assert_metadata(type, ruby)
    assert_node_metadata(
      type,
      parse(ruby),
      start_line: 1,
      start_char: 0,
      end_line: [1, ruby.count("\n")].max,
      end_char: ruby.chomp.size
    )
  end

  def assert_node_metadata(
    type,
    node,
    start_char:,
    end_char:,
    start_line: 1,
    end_line: 1,
    **metadata
  )
    assert_equal(type, node[:type])

    assert_equal(start_line, node[:loc].start_line)
    assert_equal(start_char, node[:loc].start_char)
    assert_equal(end_line, node[:loc].end_line)
    assert_equal(end_char, node[:loc].end_char)

    metadata.each { |key, value| assert_equal(value, node[key]) }
  end

  def parse(ruby)
    Prettier::Parser.parse(ruby).dig(:body, 0, :body, 0)
  end
end
