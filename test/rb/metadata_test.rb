# frozen_string_literal: true

require 'test_helper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata Prettier::Parser::BEGINBlock, <<~SOURCE
      BEGIN {
      }
    SOURCE
  end

  def test_END
    assert_metadata Prettier::Parser::ENDBlock, <<~SOURCE
      END {
      }
    SOURCE
  end

  def test_alias
    assert_metadata Prettier::Parser::Alias, 'alias foo bar'
  end

  def test_array_args
    assert_metadata Prettier::Parser::ArrayLiteral, <<~SOURCE
      [
        foo,
        bar,
        baz
      ]
    SOURCE
  end

  def test_array_args_add_star
    assert_metadata Prettier::Parser::ArrayLiteral, <<~SOURCE
      [
        foo,
        *bar,
        baz
      ]
    SOURCE
  end

  def test_array_qwords
    assert_metadata Prettier::Parser::ArrayLiteral, <<~SOURCE
      %w[
        foo
        bar
        baz
      ]
    SOURCE
  end

  def test_aref
    assert_metadata Prettier::Parser::ARef, 'foo[bar]'
  end

  def test_aref_field
    assert_node_metadata(
      Prettier::Parser::ARefField,
      parse('foo[bar] = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_args
    assert_node_metadata(
      Prettier::Parser::Args,
      parse('foo bar, baz').arguments.arguments,
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_block
    assert_node_metadata(
      Prettier::Parser::ArgsAddBlock,
      parse('foo bar, baz').arguments,
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_star
    assert_node_metadata(
      Prettier::Parser::ArgsAddStar,
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
      Prettier::Parser::ArgParen,
      parse(content).arguments,
      start_char: 3,
      end_char: 20,
      start_line: 1,
      end_line: 5
    )
  end

  def test_assign
    assert_metadata Prettier::Parser::Assign, 'foo = bar'
  end

  def test_assoc_new
    assert_node_metadata(
      Prettier::Parser::AssocNew,
      parse('{ foo: bar, bar: baz }').contents.assocs.first,
      start_char: 2,
      end_char: 10
    )
  end

  def test_assoc_splat
    assert_node_metadata(
      Prettier::Parser::AssocSplat,
      parse('foo **bar').arguments.arguments.parts.first.assocs.first,
      start_char: 4,
      end_char: 9
    )
  end

  def test_assoclist_from_args
    assert_node_metadata(
      Prettier::Parser::AssocListFromArgs,
      parse('{ foo => bar }').contents,
      start_char: 1,
      end_char: 13
    )
  end

  def test_bare_assoc_hash
    assert_node_metadata(
      Prettier::Parser::BareAssocHash,
      parse('foo(bar: baz)').arguments.arguments.arguments.parts.first,
      start_char: 4,
      end_char: 12
    )
  end

  def test_begin
    assert_metadata Prettier::Parser::Begin, <<~SOURCE
      begin
        begin; end
      end
    SOURCE
  end

  def test_binary
    assert_metadata Prettier::Parser::Binary, 'foo + bar'
  end

  def test_blockarg
    assert_node_metadata(
      Prettier::Parser::BlockArg,
      parse('def foo(&bar) end').params.contents.block,
      start_char: 8,
      end_char: 12
    )
  end

  def test_block_var
    assert_node_metadata(
      Prettier::Parser::BlockVar,
      parse('foo { |bar| }').block.block_var,
      start_char: 6,
      end_char: 11
    )
  end

  def test_bodystmt
    assert_node_metadata(
      Prettier::Parser::BodyStmt,
      parse('class Foo; def foo; end; end').bodystmt,
      start_char: 9,
      end_char: 25
    )
  end

  def test_brace_block
    assert_node_metadata(
      Prettier::Parser::BraceBlock,
      parse('foo { bar }').block,
      start_char: 4,
      end_char: 11
    )
  end

  def test_break
    assert_metadata Prettier::Parser::Break, 'break foo'
  end

  def test_call
    assert_metadata Prettier::Parser::Call, 'foo.bar'
  end

  def test_case
    assert_metadata Prettier::Parser::Case, <<~SOURCE
      case foo
      when bar
        case baz
        when qux
        end
      end
    SOURCE
  end

  def test_class
    assert_metadata Prettier::Parser::ClassDeclaration, <<~SOURCE
      class Foo
        class Bar; end
      end
    SOURCE
  end

  def test_command
    assert_metadata Prettier::Parser::Command, 'foo bar'
  end

  def test_command_call
    assert_metadata Prettier::Parser::CommandCall, 'foo.bar baz'
  end

  def test_const_ref
    assert_node_metadata(
      Prettier::Parser::ConstRef,
      parse('class Foo; end').constant,
      start_char: 6,
      end_char: 9
    )
  end

  def test_const_path_field
    assert_node_metadata(
      Prettier::Parser::ConstPathField,
      parse('Foo::Bar = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_const_path_ref
    assert_metadata Prettier::Parser::ConstPathRef, 'Foo::Bar'
  end

  def test_def
    assert_metadata Prettier::Parser::Def, <<~SOURCE
      def foo
        def bar; end
      end
    SOURCE
  end

  def test_defined
    assert_metadata Prettier::Parser::Defined, <<~SOURCE
      defined?(
        Foo
      )
    SOURCE
  end

  def test_defs
    assert_metadata Prettier::Parser::Defs, <<~SOURCE
      def Object.foo
        def Object.bar; end
      end
    SOURCE
  end

  def test_do_block
    assert_node_metadata(
      Prettier::Parser::DoBlock,
      parse('foo do; bar; end').block,
      start_char: 4,
      end_char: 16
    )
  end

  def test_dot2
    assert_metadata Prettier::Parser::Dot2, 'foo..bar'
  end

  def test_dot3
    assert_metadata Prettier::Parser::Dot3, 'foo...bar'
  end

  def test_dyna_symbol
    assert_metadata Prettier::Parser::DynaSymbol, ':"foo #{bar} baz"'
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
      Prettier::Parser::Else,
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
      Prettier::Parser::Elsif,
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
      Prettier::Parser::Ensure,
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
        Prettier::Parser::ExcessedComma,
        parse('foo { |bar,| }').block.block_var.params.rest,
        start_char: 10,
        end_char: 11
      )
    end
  end

  def test_fcall
    assert_node_metadata(
      Prettier::Parser::FCall,
      parse('foo(bar)').call,
      start_char: 0,
      end_char: 3
    )
  end

  def test_field
    assert_node_metadata(
      Prettier::Parser::Field,
      parse('foo.bar = baz').target,
      start_char: 0,
      end_char: 7
    )
  end

  def test_for
    assert_metadata Prettier::Parser::For, <<~SOURCE
      for foo in bar do
        for baz in qux do
        end
      end
    SOURCE
  end

  def test_hash
    assert_metadata Prettier::Parser::HashLiteral, <<~SOURCE
      {
        foo: 'bar'
      }
    SOURCE
  end

  def test_if
    assert_metadata Prettier::Parser::If, <<~SOURCE
      if foo
        if bar; end
      end
    SOURCE
  end

  def test_ifop
    assert_metadata Prettier::Parser::IfOp, 'foo ? bar : baz'
  end

  def test_if_mod
    assert_metadata Prettier::Parser::IfMod, 'foo if bar'
  end

  def test_kwrest_param
    assert_node_metadata(
      Prettier::Parser::KwRestParam,
      parse('def foo(**bar); end').params.contents.keyword_rest,
      start_char: 8,
      end_char: 13
    )
  end

  def test_lambda
    assert_metadata Prettier::Parser::Lambda, <<~SOURCE
      -> (foo, bar) {
        foo + bar
      }
    SOURCE
  end

  def test_massign
    assert_metadata Prettier::Parser::MAssign, 'foo, bar, baz = 1, 2, 3'
  end

  def test_method_add_arg
    assert_metadata Prettier::Parser::MethodAddArg, 'foo(bar)'
  end

  def test_method_add_block
    assert_metadata Prettier::Parser::MethodAddBlock, 'foo { bar }'
  end

  def test_mlhs
    assert_node_metadata(
      Prettier::Parser::MLHS,
      parse('foo, bar, baz = 1, 2, 3').target,
      start_char: 0,
      end_char: 13
    )
  end

  def test_mlhs_add_post
    assert_node_metadata(
      Prettier::Parser::MLHSAddPost,
      parse('foo, *bar, baz = 1, 2, 3').target,
      start_char: 5,
      end_char: 14
    )
  end

  def test_mlhs_add_star
    assert_node_metadata(
      Prettier::Parser::MLHSAddStar,
      parse('foo, *bar = 1, 2, 3').target,
      start_char: 5,
      end_char: 9
    )
  end

  def test_mlhs_paren
    assert_node_metadata(
      Prettier::Parser::MLHSParen,
      parse('(foo, bar) = baz').target,
      start_char: 0,
      end_char: 10
    )
  end

  def test_module
    assert_metadata Prettier::Parser::ModuleDeclaration, <<~SOURCE
      module Foo
        module Bar; end
      end
    SOURCE
  end

  def test_mrhs_add_star
    assert_node_metadata(
      Prettier::Parser::MRHSAddStar,
      parse('foo, bar = *baz').value,
      start_char: 11,
      end_char: 15
    )
  end

  def test_next
    assert_metadata Prettier::Parser::Next, 'next foo'
  end

  def test_opassign
    assert_metadata Prettier::Parser::OpAssign, 'foo ||= bar'
  end

  def test_params
    content = <<~SOURCE
      def foo(
        bar,
        baz
      ); end
    SOURCE

    assert_node_metadata(
      Prettier::Parser::Params,
      parse(content).params.contents,
      start_char: 8,
      end_char: 22,
      start_line: 2,
      end_line: 3
    )
  end

  def test_paren
    assert_metadata Prettier::Parser::Paren, '()'
  end

  def test_qsymbols
    assert_node_metadata(
      Prettier::Parser::QSymbols,
      parse('%i[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_qwords
    assert_node_metadata(
      Prettier::Parser::QWords,
      parse('%w[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_redo
    assert_metadata Prettier::Parser::Redo, 'redo'
  end

  def test_regexp_literal
    assert_metadata Prettier::Parser::RegexpLiteral, '/foo/'
    assert_metadata Prettier::Parser::RegexpLiteral, '%r{foo}'
    assert_metadata Prettier::Parser::RegexpLiteral, '%r(foo)'

    assert_node_metadata(
      Prettier::Parser::RegexpLiteral,
      parse('%r(foo)'),
      beginning: '%r(',
      ending: ')',
      start_char: 0,
      end_char: 7
    )
  end

  def test_rescue
    assert_node_metadata(
      Prettier::Parser::Rescue,
      parse('begin; foo; rescue => bar; baz; end').bodystmt.rescue_clause,
      start_char: 12,
      end_char: 35
    )
  end

  def test_rescue_mod
    assert_metadata Prettier::Parser::RescueMod, 'foo rescue bar'
  end

  def test_rest_param
    assert_node_metadata(
      Prettier::Parser::RestParam,
      parse('def foo(*bar); end').params.contents.rest,
      start_char: 8,
      end_char: 12
    )
  end

  def test_retry
    assert_metadata Prettier::Parser::Retry, 'retry'
  end

  def test_return
    assert_metadata Prettier::Parser::Return, 'return foo'
  end

  def test_return0
    assert_metadata Prettier::Parser::Return0, 'return'
  end

  def test_sclass
    assert_metadata Prettier::Parser::SClass, <<~SOURCE
      class << Foo
        class << Bar; end
      end
    SOURCE
  end

  def test_string_concat
    assert_metadata Prettier::Parser::StringConcat, <<~SOURCE
      'foo' \
        'bar'
    SOURCE
  end

  def test_string_dvar
    assert_node_metadata(
      Prettier::Parser::StringDVar,
      parse('"#$foo"').parts.first,
      start_char: 1,
      end_char: 6
    )
  end

  def test_string_embexpr
    assert_node_metadata(
      Prettier::Parser::StringEmbExpr,
      parse('"foo #{bar} baz"').parts[1],
      start_char: 5,
      end_char: 11
    )
  end

  def test_string_literal
    assert_metadata Prettier::Parser::StringLiteral, '"foo"'
  end

  def test_super
    assert_metadata Prettier::Parser::Super, 'super foo'
  end

  def test_symbol_literal
    assert_metadata Prettier::Parser::SymbolLiteral, ':foo'
  end

  def test_symbols
    assert_node_metadata(
      Prettier::Parser::Symbols,
      parse('%I[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_top_const_field
    assert_node_metadata(
      Prettier::Parser::TopConstField,
      parse('::Foo = bar').target,
      start_char: 0,
      end_char: 5
    )
  end

  def test_top_const_ref
    assert_metadata Prettier::Parser::TopConstRef, '::Foo'
  end

  def test_unary
    assert_metadata Prettier::Parser::Unary, '-foo'
    assert_metadata Prettier::Parser::Not, 'not foo'
  end

  def test_undef
    assert_metadata Prettier::Parser::Undef, 'undef foo, bar'
  end

  def test_unless
    assert_metadata Prettier::Parser::Unless, <<~SOURCE
      unless foo
        unless bar; end
      end
    SOURCE
  end

  def test_unless_mod
    assert_metadata Prettier::Parser::UnlessMod, 'foo unless bar'
  end

  def test_until
    assert_metadata Prettier::Parser::Until, <<~SOURCE
      until foo
        until bar; end
      end
    SOURCE
  end

  def test_until_mod
    assert_metadata Prettier::Parser::UntilMod, 'foo until bar'
  end

  def test_while
    assert_metadata Prettier::Parser::While, <<~SOURCE
      while foo
        while bar; end
      end
    SOURCE
  end

  def test_var_alias
    assert_metadata Prettier::Parser::VarAlias, 'alias $foo $bar'
  end

  def test_var_field
    assert_node_metadata(
      Prettier::Parser::VarField,
      parse('foo = 1').target,
      start_char: 0,
      end_char: 3
    )
  end

  def test_var_ref
    assert_metadata Prettier::Parser::VarRef, 'true'
  end

  def test_vcall
    assert_metadata Prettier::Parser::VCall, 'foo'
  end

  def test_void_stmt
    assert_node_metadata(
      Prettier::Parser::VoidStmt,
      parse('; ;'),
      start_char: 0,
      end_char: 0
    )
  end

  def test_when
    assert_node_metadata(
      Prettier::Parser::When,
      parse('case foo; when bar; baz; end').consequent,
      start_char: 10,
      end_char: 28
    )
  end

  def test_while_mod
    assert_metadata Prettier::Parser::WhileMod, 'foo while bar'
  end

  def test_words
    assert_node_metadata(
      Prettier::Parser::Words,
      parse('%W[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_xstring
    assert_metadata Prettier::Parser::XStringLiteral, <<~SOURCE
      `
        foo
        bar
      `
    SOURCE
  end

  def test_yield
    assert_metadata Prettier::Parser::Yield, 'yield foo'
  end

  def test_yield0
    assert_metadata Prettier::Parser::Yield0, 'yield'
  end

  def test_zsuper
    assert_metadata Prettier::Parser::ZSuper, 'super'
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.7')
    def test_args_forward
      content = <<~SOURCE
        def foo(...)
          bar(...)
        end
      SOURCE

      assert_node_metadata(
        Prettier::Parser::ArgsForward,
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
        Prettier::Parser::AryPtn,
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
        Prettier::Parser::In,
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
    Prettier::Parser.parse(ruby).statements.body.first
  end
end
