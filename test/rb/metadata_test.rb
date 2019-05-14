# frozen_string_literal: true

require 'test_helper'
require_relative '../../src/ripper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata :BEGIN, <<~RUBY
      BEGIN {
      }
    RUBY
  end

  def test_END
    assert_metadata :END, <<~RUBY
      END {
      }
    RUBY
  end

  def test_alias
    assert_metadata :alias, 'alias foo bar'
  end

  def test_aref
    assert_metadata :aref, 'foo[bar]'
  end

  def test_aref_field
    assert_node_metadata(
      :aref_field,
      parse('foo[bar] = baz').dig(:body, 0),
      char_start: 0,
      char_end: 10
    )
  end

  def test_assign
    assert_metadata :assign, 'foo = bar'
  end

  def test_bare_assoc_hash
    assert_node_metadata(
      :bare_assoc_hash,
      parse('foo(bar: baz)').dig(:body, 1, :body, 0, :body, 0, :body, 0),
      char_start: 4,
      char_end: 13
    )
  end

  def test_begin
    assert_metadata :begin, <<~RUBY
      begin
        begin; end
      end
    RUBY
  end

  def test_binary
    assert_metadata :binary, 'foo + bar'
  end

  def test_brace_block
    assert_node_metadata(
      :brace_block,
      parse('foo { bar }').dig(:body, 1),
      char_start: 4,
      char_end: 11
    )
  end

  def test_break
    assert_metadata :break, 'break foo'
  end

  def test_call
    assert_metadata :call, 'foo.bar'
  end

  def test_case
    assert_metadata :case, <<~RUBY
      case foo
      when bar
        case baz
        when qux
        end
      end
    RUBY
  end

  def test_class
    assert_metadata :class, <<~RUBY
      class Foo
        class Bar; end
      end
    RUBY
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
      char_start: 6,
      char_end: 10
    )
  end

  def test_const_path_field
    assert_node_metadata(
      :const_path_field,
      parse('Foo::Bar = baz').dig(:body, 0),
      char_start: 0,
      char_end: 10
    )
  end

  def test_const_path_ref
    assert_metadata :const_path_ref, 'Foo::Bar'
  end

  def test_def
    assert_metadata :def, <<~RUBY
      def foo
        def bar; end
      end
    RUBY
  end

  def test_defined
    assert_metadata :defined, <<~RUBY
      defined?(
        Foo
      )
    RUBY
  end

  def test_defs
    assert_metadata :defs, <<~RUBY
      def Object.foo
        def Object.bar; end
      end
    RUBY
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
    content = <<~RUBY
      if foo
        bar
      else
        baz
      end
    RUBY

    assert_node_metadata(
      :else,
      parse(content).dig(:body, 2),
      char_start: 13,
      char_end: 27
    )
  end

  def test_elsif
    content = <<~RUBY
      if foo
        bar
      elsif bar
        qux
      end
    RUBY

    assert_node_metadata(
      :elsif,
      parse(content).dig(:body, 2),
      char_start: 13,
      char_end: 32
    )
  end

  def test_ensure
    content = <<~RUBY
      begin
        foo
      ensure
        bar
      end
    RUBY

    assert_node_metadata(
      :ensure,
      parse(content).dig(:body, 0, :body, 3),
      char_start: 12,
      char_end: 28
    )
  end

  def test_excessed_comma
    assert_node_metadata(
      :excessed_comma,
      parse('foo { |bar,| }').dig(:body, 1, :body, 0, :body, 0, :body, 2),
      char_start: 10,
      char_end: 12
    )
  end

  def test_field
    assert_node_metadata(
      :field,
      parse('foo.bar = baz').dig(:body, 0),
      char_start: 0,
      char_end: 9
    )
  end

  def test_for
    assert_metadata :for, <<~RUBY
      for foo in bar do
        for baz in qux do
        end
      end
    RUBY
  end

  def test_if
    assert_metadata :if, <<~RUBY
      if foo
        if bar; end
      end
    RUBY
  end

  def test_ifop
    assert_metadata :ifop, 'foo ? bar : baz'
  end

  def test_if_mod
    assert_metadata :if_mod, 'foo if bar'
  end

  def test_massign
    assert_metadata :massign, 'foo, bar, baz = 1, 2, 3'
  end

  def test_mlhs
    assert_node_metadata(
      :mlhs,
      parse('foo, bar, baz = 1, 2, 3').dig(:body, 0),
      char_start: 0,
      char_end: 15
    )
  end

  def test_mlhs_add_post
    assert_node_metadata(
      :mlhs_add_post,
      parse('foo, *bar, baz = 1, 2, 3').dig(:body, 0),
      char_start: 0,
      char_end: 16
    )
  end

  def test_mlhs_add_star
    assert_node_metadata(
      :mlhs_add_star,
      parse('foo, *bar = 1, 2, 3').dig(:body, 0),
      char_start: 0,
      char_end: 11
    )
  end

  def test_mlhs_paren
    assert_node_metadata(
      :mlhs_paren,
      parse('(foo, bar) = baz').dig(:body, 0),
      char_start: 0,
      char_end: 12
    )
  end

  def test_module
    assert_metadata :module, <<~RUBY
      module Foo
        module Bar; end
      end
    RUBY
  end

  def test_next
    assert_metadata :next, 'next foo'
  end

  def test_opassign
    assert_metadata :opassign, 'foo ||= bar'
  end

  def test_qsymbols
    assert_node_metadata(
      :qsymbols,
      parse('%i[foo bar baz]').dig(:body, 0),
      char_start: 0,
      char_end: 14
    )
  end

  def test_qwords
    assert_node_metadata(
      :qwords,
      parse('%w[foo bar baz]').dig(:body, 0),
      char_start: 0,
      char_end: 14
    )
  end

  def test_redo
    assert_metadata :redo, 'redo'
  end

  def test_rescue
    assert_node_metadata(
      :rescue,
      parse('begin; foo; rescue => bar; baz; end').dig(:body, 0, :body, 1),
      char_start: 12,
      char_end: 35
    )
  end

  def test_rescue_mod
    assert_metadata :rescue_mod, 'foo rescue bar'
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
    assert_metadata :sclass, <<~RUBY
      class << Foo
        class << Bar; end
      end
    RUBY
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
      char_start: 0,
      char_end: 23
    )
  end

  def test_top_const_field
    assert_node_metadata(
      :top_const_field,
      parse('::Foo = bar').dig(:body, 0),
      char_start: 0,
      char_end: 7
    )
  end

  def test_top_const_ref
    assert_metadata :top_const_ref, '::Foo'
  end

  def test_undef
    assert_metadata :undef, 'undef foo, bar'
  end

  def test_unless
    assert_metadata :unless, <<~RUBY
      unless foo
        unless bar; end
      end
    RUBY
  end

  def test_unless_mod
    assert_metadata :unless_mod, 'foo unless bar'
  end

  def test_until
    assert_metadata :until, <<~RUBY
      until foo
        until bar; end
      end
    RUBY
  end

  def test_until_mod
    assert_metadata :until_mod, 'foo until bar'
  end

  def test_while
    assert_metadata :while, <<~RUBY
      while foo
        while bar; end
      end
    RUBY
  end

  def test_var_ref
    assert_metadata :var_ref, 'true'
  end

  def test_vcall
    assert_metadata :vcall, 'foo'
  end

  def test_while_mod
    assert_metadata :while_mod, 'foo while bar'
  end

  def test_words
    assert_node_metadata(
      :words,
      parse('%W[f#{o}o b#{a}r b#{a}z]').dig(:body, 0),
      char_start: 0,
      char_end: 23
    )
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

  private

  def assert_metadata(type, ruby)
    assert_node_metadata(
      type,
      parse(ruby),
      char_start: 0,
      char_end: ruby.chomp.size
    )
  end

  def assert_node_metadata(type, node, metadata)
    assert_equal type, node[:type]

    metadata.each do |key, value|
      assert_equal value, node[key]
    end
  end

  def parse(ruby)
    RipperJS.parse(ruby).dig(:body, 0, :body, 0)
  end
end

__END__
arg_paren
args_add
args_add_block
args_add_star
args_new
array
assoc_new
assoc_splat
assoclist_from_args
block_var
blockarg
bodystmt
do_block
fcall
hash
kwrest_param
lambda
magic_comment
method_add_arg
method_add_block
mrhs_add
mrhs_add_star
mrhs_new
mrhs_new_from_args
params
paren
regexp_add
regexp_literal
regexp_new
rest_param
stmts_add
stmts_new
string_add
string_concat
string_content
string_dvar
string_embexpr
string_literal
symbol
unary
var_alias
var_field
void_stmt
when
xstring_add
xstring_literal
xstring_new
