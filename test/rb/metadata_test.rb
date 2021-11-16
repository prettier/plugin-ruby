# frozen_string_literal: true

require 'test_helper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata Ripper::ParseTree::BEGINBlock, <<~SOURCE
      BEGIN {
      }
    SOURCE
  end

  def test_END
    assert_metadata Ripper::ParseTree::ENDBlock, <<~SOURCE
      END {
      }
    SOURCE
  end

  def test_alias
    assert_metadata Ripper::ParseTree::Alias, 'alias foo bar'
  end

  def test_array_args
    assert_metadata Ripper::ParseTree::ArrayLiteral, <<~SOURCE
      [
        foo,
        bar,
        baz
      ]
    SOURCE
  end

  def test_array_args_add_star
    assert_metadata Ripper::ParseTree::ArrayLiteral, <<~SOURCE
      [
        foo,
        *bar,
        baz
      ]
    SOURCE
  end

  def test_array_qwords
    assert_metadata Ripper::ParseTree::ArrayLiteral, <<~SOURCE
      %w[
        foo
        bar
        baz
      ]
    SOURCE
  end

  def test_aref
    assert_metadata Ripper::ParseTree::ARef, 'foo[bar]'
  end

  def test_aref_field
    assert_node_metadata(
      Ripper::ParseTree::ARefField,
      parse('foo[bar] = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_args
    assert_node_metadata(
      Ripper::ParseTree::Args,
      parse('foo bar, baz').arguments.arguments,
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_block
    assert_node_metadata(
      Ripper::ParseTree::ArgsAddBlock,
      parse('foo bar, baz').arguments,
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_star
    assert_node_metadata(
      Ripper::ParseTree::ArgsAddStar,
      parse('foo *bar').arguments.arguments,
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
      Ripper::ParseTree::ArgParen,
      parse(content).arguments,
      start_char: 3,
      end_char: 20,
      start_line: 1,
      end_line: 5
    )
  end

  def test_assign
    assert_metadata Ripper::ParseTree::Assign, 'foo = bar'
  end

  def test_assoc_new
    assert_node_metadata(
      Ripper::ParseTree::AssocNew,
      parse('{ foo: bar, bar: baz }').contents.assocs.first,
      start_char: 2,
      end_char: 10
    )
  end

  def test_assoc_splat
    assert_node_metadata(
      Ripper::ParseTree::AssocSplat,
      parse('foo **bar').arguments.arguments.parts.first.assocs.first,
      start_char: 4,
      end_char: 9
    )
  end

  def test_assoclist_from_args
    assert_node_metadata(
      Ripper::ParseTree::AssocListFromArgs,
      parse('{ foo => bar }').contents,
      start_char: 1,
      end_char: 13
    )
  end

  def test_bare_assoc_hash
    assert_node_metadata(
      Ripper::ParseTree::BareAssocHash,
      parse('foo(bar: baz)').arguments.arguments.arguments.parts.first,
      start_char: 4,
      end_char: 12
    )
  end

  def test_begin
    assert_metadata Ripper::ParseTree::Begin, <<~SOURCE
      begin
        begin; end
      end
    SOURCE
  end

  def test_binary
    assert_metadata Ripper::ParseTree::Binary, 'foo + bar'
  end

  def test_blockarg
    assert_node_metadata(
      Ripper::ParseTree::BlockArg,
      parse('def foo(&bar) end').params.contents.block,
      start_char: 8,
      end_char: 12
    )
  end

  def test_block_var
    assert_node_metadata(
      Ripper::ParseTree::BlockVar,
      parse('foo { |bar| }').block.block_var,
      start_char: 6,
      end_char: 11
    )
  end

  def test_bodystmt
    assert_node_metadata(
      Ripper::ParseTree::BodyStmt,
      parse('class Foo; def foo; end; end').bodystmt,
      start_char: 9,
      end_char: 25
    )
  end

  def test_brace_block
    assert_node_metadata(
      Ripper::ParseTree::BraceBlock,
      parse('foo { bar }').block,
      start_char: 4,
      end_char: 11
    )
  end

  def test_break
    assert_metadata Ripper::ParseTree::Break, 'break foo'
  end

  def test_call
    assert_metadata Ripper::ParseTree::Call, 'foo.bar'
  end

  def test_case
    assert_metadata Ripper::ParseTree::Case, <<~SOURCE
      case foo
      when bar
        case baz
        when qux
        end
      end
    SOURCE
  end

  def test_class
    assert_metadata Ripper::ParseTree::ClassDeclaration, <<~SOURCE
      class Foo
        class Bar; end
      end
    SOURCE
  end

  def test_command
    assert_metadata Ripper::ParseTree::Command, 'foo bar'
  end

  def test_command_call
    assert_metadata Ripper::ParseTree::CommandCall, 'foo.bar baz'
  end

  def test_const_ref
    assert_node_metadata(
      Ripper::ParseTree::ConstRef,
      parse('class Foo; end').constant,
      start_char: 6,
      end_char: 9
    )
  end

  def test_const_path_field
    assert_node_metadata(
      Ripper::ParseTree::ConstPathField,
      parse('Foo::Bar = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_const_path_ref
    assert_metadata Ripper::ParseTree::ConstPathRef, 'Foo::Bar'
  end

  def test_def
    assert_metadata Ripper::ParseTree::Def, <<~SOURCE
      def foo
        def bar; end
      end
    SOURCE
  end

  def test_defined
    assert_metadata Ripper::ParseTree::Defined, <<~SOURCE
      defined?(
        Foo
      )
    SOURCE
  end

  def test_defs
    assert_metadata Ripper::ParseTree::Defs, <<~SOURCE
      def Object.foo
        def Object.bar; end
      end
    SOURCE
  end

  def test_do_block
    assert_node_metadata(
      Ripper::ParseTree::DoBlock,
      parse('foo do; bar; end').block,
      start_char: 4,
      end_char: 16
    )
  end

  def test_dot2
    assert_metadata Ripper::ParseTree::Dot2, 'foo..bar'
  end

  def test_dot3
    assert_metadata Ripper::ParseTree::Dot3, 'foo...bar'
  end

  def test_dyna_symbol
    assert_metadata Ripper::ParseTree::DynaSymbol, ':"foo #{bar} baz"'
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
      Ripper::ParseTree::Else,
      parse(content).consequent,
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
      Ripper::ParseTree::Elsif,
      parse(content).consequent,
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
      Ripper::ParseTree::Ensure,
      parse(content).bodystmt.ensure_clause,
      start_char: 12,
      end_char: 28,
      start_line: 3,
      end_line: 5
    )
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.6')
    def test_excessed_comma
      assert_node_metadata(
        Ripper::ParseTree::ExcessedComma,
        parse('foo { |bar,| }').block.block_var.params.rest,
        start_char: 10,
        end_char: 11
      )
    end
  end

  def test_fcall
    assert_node_metadata(
      Ripper::ParseTree::FCall,
      parse('foo(bar)').call,
      start_char: 0,
      end_char: 3
    )
  end

  def test_field
    assert_node_metadata(
      Ripper::ParseTree::Field,
      parse('foo.bar = baz').target,
      start_char: 0,
      end_char: 7
    )
  end

  def test_for
    assert_metadata Ripper::ParseTree::For, <<~SOURCE
      for foo in bar do
        for baz in qux do
        end
      end
    SOURCE
  end

  def test_hash
    assert_metadata Ripper::ParseTree::HashLiteral, <<~SOURCE
      {
        foo: 'bar'
      }
    SOURCE
  end

  def test_if
    assert_metadata Ripper::ParseTree::If, <<~SOURCE
      if foo
        if bar; end
      end
    SOURCE
  end

  def test_ifop
    assert_metadata Ripper::ParseTree::IfOp, 'foo ? bar : baz'
  end

  def test_if_mod
    assert_metadata Ripper::ParseTree::IfMod, 'foo if bar'
  end

  def test_kwrest_param
    assert_node_metadata(
      Ripper::ParseTree::KwRestParam,
      parse('def foo(**bar); end').params.contents.keyword_rest,
      start_char: 8,
      end_char: 13
    )
  end

  def test_lambda
    assert_metadata Ripper::ParseTree::Lambda, <<~SOURCE
      -> (foo, bar) {
        foo + bar
      }
    SOURCE
  end

  def test_massign
    assert_metadata Ripper::ParseTree::MAssign, 'foo, bar, baz = 1, 2, 3'
  end

  def test_method_add_arg
    assert_metadata Ripper::ParseTree::MethodAddArg, 'foo(bar)'
  end

  def test_method_add_block
    assert_metadata Ripper::ParseTree::MethodAddBlock, 'foo { bar }'
  end

  def test_mlhs
    assert_node_metadata(
      Ripper::ParseTree::MLHS,
      parse('foo, bar, baz = 1, 2, 3').target,
      start_char: 0,
      end_char: 13
    )
  end

  def test_mlhs_add_post
    assert_node_metadata(
      Ripper::ParseTree::MLHSAddPost,
      parse('foo, *bar, baz = 1, 2, 3').target,
      start_char: 5,
      end_char: 14
    )
  end

  def test_mlhs_add_star
    assert_node_metadata(
      Ripper::ParseTree::MLHSAddStar,
      parse('foo, *bar = 1, 2, 3').target,
      start_char: 5,
      end_char: 9
    )
  end

  def test_mlhs_paren
    assert_node_metadata(
      Ripper::ParseTree::MLHSParen,
      parse('(foo, bar) = baz').target,
      start_char: 0,
      end_char: 10
    )
  end

  def test_module
    assert_metadata Ripper::ParseTree::ModuleDeclaration, <<~SOURCE
      module Foo
        module Bar; end
      end
    SOURCE
  end

  def test_mrhs_add_star
    assert_node_metadata(
      Ripper::ParseTree::MRHSAddStar,
      parse('foo, bar = *baz').value,
      start_char: 11,
      end_char: 15
    )
  end

  def test_next
    assert_metadata Ripper::ParseTree::Next, 'next foo'
  end

  def test_opassign
    assert_metadata Ripper::ParseTree::OpAssign, 'foo ||= bar'
  end

  def test_params
    content = <<~SOURCE
      def foo(
        bar,
        baz
      ); end
    SOURCE

    assert_node_metadata(
      Ripper::ParseTree::Params,
      parse(content).params.contents,
      start_char: 8,
      end_char: 22,
      start_line: 2,
      end_line: 3
    )
  end

  def test_paren
    assert_metadata Ripper::ParseTree::Paren, '()'
  end

  def test_qsymbols
    assert_node_metadata(
      Ripper::ParseTree::QSymbols,
      parse('%i[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_qwords
    assert_node_metadata(
      Ripper::ParseTree::QWords,
      parse('%w[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_redo
    assert_metadata Ripper::ParseTree::Redo, 'redo'
  end

  def test_regexp_literal
    assert_metadata Ripper::ParseTree::RegexpLiteral, '/foo/'
    assert_metadata Ripper::ParseTree::RegexpLiteral, '%r{foo}'
    assert_metadata Ripper::ParseTree::RegexpLiteral, '%r(foo)'

    assert_node_metadata(
      Ripper::ParseTree::RegexpLiteral,
      parse('%r(foo)'),
      beginning: '%r(',
      ending: ')',
      start_char: 0,
      end_char: 7
    )
  end

  def test_rescue
    assert_node_metadata(
      Ripper::ParseTree::Rescue,
      parse('begin; foo; rescue => bar; baz; end').bodystmt.rescue_clause,
      start_char: 12,
      end_char: 35
    )
  end

  def test_rescue_mod
    assert_metadata Ripper::ParseTree::RescueMod, 'foo rescue bar'
  end

  def test_rest_param
    assert_node_metadata(
      Ripper::ParseTree::RestParam,
      parse('def foo(*bar); end').params.contents.rest,
      start_char: 8,
      end_char: 12
    )
  end

  def test_retry
    assert_metadata Ripper::ParseTree::Retry, 'retry'
  end

  def test_return
    assert_metadata Ripper::ParseTree::Return, 'return foo'
  end

  def test_return0
    assert_metadata Ripper::ParseTree::Return0, 'return'
  end

  def test_sclass
    assert_metadata Ripper::ParseTree::SClass, <<~SOURCE
      class << Foo
        class << Bar; end
      end
    SOURCE
  end

  def test_string_concat
    assert_metadata Ripper::ParseTree::StringConcat, <<~SOURCE
      'foo' \
        'bar'
    SOURCE
  end

  def test_string_dvar
    assert_node_metadata(
      Ripper::ParseTree::StringDVar,
      parse('"#$foo"').parts.first,
      start_char: 1,
      end_char: 6
    )
  end

  def test_string_embexpr
    assert_node_metadata(
      Ripper::ParseTree::StringEmbExpr,
      parse('"foo #{bar} baz"').parts[1],
      start_char: 5,
      end_char: 11
    )
  end

  def test_string_literal
    assert_metadata Ripper::ParseTree::StringLiteral, '"foo"'
  end

  def test_super
    assert_metadata Ripper::ParseTree::Super, 'super foo'
  end

  def test_symbol_literal
    assert_metadata Ripper::ParseTree::SymbolLiteral, ':foo'
  end

  def test_symbols
    assert_node_metadata(
      Ripper::ParseTree::Symbols,
      parse('%I[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_top_const_field
    assert_node_metadata(
      Ripper::ParseTree::TopConstField,
      parse('::Foo = bar').target,
      start_char: 0,
      end_char: 5
    )
  end

  def test_top_const_ref
    assert_metadata Ripper::ParseTree::TopConstRef, '::Foo'
  end

  def test_unary
    assert_metadata Ripper::ParseTree::Unary, '-foo'
    assert_metadata Ripper::ParseTree::Not, 'not foo'
  end

  def test_undef
    assert_metadata Ripper::ParseTree::Undef, 'undef foo, bar'
  end

  def test_unless
    assert_metadata Ripper::ParseTree::Unless, <<~SOURCE
      unless foo
        unless bar; end
      end
    SOURCE
  end

  def test_unless_mod
    assert_metadata Ripper::ParseTree::UnlessMod, 'foo unless bar'
  end

  def test_until
    assert_metadata Ripper::ParseTree::Until, <<~SOURCE
      until foo
        until bar; end
      end
    SOURCE
  end

  def test_until_mod
    assert_metadata Ripper::ParseTree::UntilMod, 'foo until bar'
  end

  def test_while
    assert_metadata Ripper::ParseTree::While, <<~SOURCE
      while foo
        while bar; end
      end
    SOURCE
  end

  def test_var_alias
    assert_metadata Ripper::ParseTree::VarAlias, 'alias $foo $bar'
  end

  def test_var_field
    assert_node_metadata(
      Ripper::ParseTree::VarField,
      parse('foo = 1').target,
      start_char: 0,
      end_char: 3
    )
  end

  def test_var_ref
    assert_metadata Ripper::ParseTree::VarRef, 'true'
  end

  def test_vcall
    assert_metadata Ripper::ParseTree::VCall, 'foo'
  end

  def test_void_stmt
    assert_node_metadata(
      Ripper::ParseTree::VoidStmt,
      parse('; ;'),
      start_char: 0,
      end_char: 0
    )
  end

  def test_when
    assert_node_metadata(
      Ripper::ParseTree::When,
      parse('case foo; when bar; baz; end').consequent,
      start_char: 10,
      end_char: 28
    )
  end

  def test_while_mod
    assert_metadata Ripper::ParseTree::WhileMod, 'foo while bar'
  end

  def test_words
    assert_node_metadata(
      Ripper::ParseTree::Words,
      parse('%W[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_xstring
    assert_metadata Ripper::ParseTree::XStringLiteral, <<~SOURCE
      `
        foo
        bar
      `
    SOURCE
  end

  def test_yield
    assert_metadata Ripper::ParseTree::Yield, 'yield foo'
  end

  def test_yield0
    assert_metadata Ripper::ParseTree::Yield0, 'yield'
  end

  def test_zsuper
    assert_metadata Ripper::ParseTree::ZSuper, 'super'
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.7')
    def test_args_forward
      content = <<~SOURCE
        def foo(...)
          bar(...)
        end
      SOURCE

      assert_node_metadata(
        Ripper::ParseTree::ArgsForward,
        parse(content).params.contents.rest,
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
        Ripper::ParseTree::AryPtn,
        parse(content).consequent.pattern,
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
        Ripper::ParseTree::In,
        parse(content).consequent,
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
    assert_kind_of(type, node)

    assert_equal(start_line, node.location.start_line)
    assert_equal(start_char, node.location.start_char)
    assert_equal(end_line, node.location.end_line)
    assert_equal(end_char, node.location.end_char)

    metadata.each { |key, value| assert_equal(value, node.public_send(key)) }
  end

  def parse(ruby)
    Ripper::ParseTree.parse(ruby).statements.body.first
  end
end
