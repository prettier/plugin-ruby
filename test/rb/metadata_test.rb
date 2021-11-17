# frozen_string_literal: true

require 'test_helper'

class MetadataTest < Minitest::Test
  def test_BEGIN
    assert_metadata SyntaxTree::BEGINBlock, <<~SOURCE
      BEGIN {
      }
    SOURCE
  end

  def test_END
    assert_metadata SyntaxTree::ENDBlock, <<~SOURCE
      END {
      }
    SOURCE
  end

  def test_alias
    assert_metadata SyntaxTree::Alias, 'alias foo bar'
  end

  def test_array_args
    assert_metadata SyntaxTree::ArrayLiteral, <<~SOURCE
      [
        foo,
        bar,
        baz
      ]
    SOURCE
  end

  def test_array_qwords
    assert_metadata SyntaxTree::ArrayLiteral, <<~SOURCE
      %w[
        foo
        bar
        baz
      ]
    SOURCE
  end

  def test_aref
    assert_metadata SyntaxTree::ARef, 'foo[bar]'
  end

  def test_aref_field
    assert_node_metadata(
      SyntaxTree::ARefField,
      parse('foo[bar] = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_args
    assert_node_metadata(
      SyntaxTree::Args,
      parse('foo bar, baz').arguments.arguments,
      start_char: 4,
      end_char: 12
    )
  end

  def test_args_add_block
    assert_node_metadata(
      SyntaxTree::ArgsAddBlock,
      parse('foo bar, baz').arguments,
      start_char: 4,
      end_char: 12
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
      SyntaxTree::ArgParen,
      parse(content).arguments,
      start_char: 3,
      end_char: 20,
      start_line: 1,
      end_line: 5
    )
  end

  def test_assign
    assert_metadata SyntaxTree::Assign, 'foo = bar'
  end

  def test_assoc
    assert_node_metadata(
      SyntaxTree::Assoc,
      parse('{ foo: bar, bar: baz }').contents.assocs.first,
      start_char: 2,
      end_char: 10
    )
  end

  def test_assoc_splat
    assert_node_metadata(
      SyntaxTree::AssocSplat,
      parse('foo **bar').arguments.arguments.parts.first.assocs.first,
      start_char: 4,
      end_char: 9
    )
  end

  def test_assoclist_from_args
    assert_node_metadata(
      SyntaxTree::AssocListFromArgs,
      parse('{ foo => bar }').contents,
      start_char: 1,
      end_char: 13
    )
  end

  def test_bare_assoc_hash
    assert_node_metadata(
      SyntaxTree::BareAssocHash,
      parse('foo(bar: baz)').arguments.arguments.arguments.parts.first,
      start_char: 4,
      end_char: 12
    )
  end

  def test_begin
    assert_metadata SyntaxTree::Begin, <<~SOURCE
      begin
        begin; end
      end
    SOURCE
  end

  def test_binary
    assert_metadata SyntaxTree::Binary, 'foo + bar'
  end

  def test_blockarg
    assert_node_metadata(
      SyntaxTree::BlockArg,
      parse('def foo(&bar) end').params.contents.block,
      start_char: 8,
      end_char: 12
    )
  end

  def test_block_var
    assert_node_metadata(
      SyntaxTree::BlockVar,
      parse('foo { |bar| }').block.block_var,
      start_char: 6,
      end_char: 11
    )
  end

  def test_bodystmt
    assert_node_metadata(
      SyntaxTree::BodyStmt,
      parse('class Foo; def foo; end; end').bodystmt,
      start_char: 9,
      end_char: 25
    )
  end

  def test_brace_block
    assert_node_metadata(
      SyntaxTree::BraceBlock,
      parse('foo { bar }').block,
      start_char: 4,
      end_char: 11
    )
  end

  def test_break
    assert_metadata SyntaxTree::Break, 'break foo'
  end

  def test_call
    assert_metadata SyntaxTree::Call, 'foo.bar'
  end

  def test_case
    assert_metadata SyntaxTree::Case, <<~SOURCE
      case foo
      when bar
        case baz
        when qux
        end
      end
    SOURCE
  end

  def test_class
    assert_metadata SyntaxTree::ClassDeclaration, <<~SOURCE
      class Foo
        class Bar; end
      end
    SOURCE
  end

  def test_command
    assert_metadata SyntaxTree::Command, 'foo bar'
  end

  def test_command_call
    assert_metadata SyntaxTree::CommandCall, 'foo.bar baz'
  end

  def test_const_ref
    assert_node_metadata(
      SyntaxTree::ConstRef,
      parse('class Foo; end').constant,
      start_char: 6,
      end_char: 9
    )
  end

  def test_const_path_field
    assert_node_metadata(
      SyntaxTree::ConstPathField,
      parse('Foo::Bar = baz').target,
      start_char: 0,
      end_char: 8
    )
  end

  def test_const_path_ref
    assert_metadata SyntaxTree::ConstPathRef, 'Foo::Bar'
  end

  def test_def
    assert_metadata SyntaxTree::Def, <<~SOURCE
      def foo
        def bar; end
      end
    SOURCE
  end

  def test_defined
    assert_metadata SyntaxTree::Defined, <<~SOURCE
      defined?(
        Foo
      )
    SOURCE
  end

  def test_defs
    assert_metadata SyntaxTree::Defs, <<~SOURCE
      def Object.foo
        def Object.bar; end
      end
    SOURCE
  end

  def test_do_block
    assert_node_metadata(
      SyntaxTree::DoBlock,
      parse('foo do; bar; end').block,
      start_char: 4,
      end_char: 16
    )
  end

  def test_dot2
    assert_metadata SyntaxTree::Dot2, 'foo..bar'
  end

  def test_dot3
    assert_metadata SyntaxTree::Dot3, 'foo...bar'
  end

  def test_dyna_symbol
    assert_metadata SyntaxTree::DynaSymbol, ':"foo #{bar} baz"'
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
      SyntaxTree::Else,
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
      SyntaxTree::Elsif,
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
      SyntaxTree::Ensure,
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
        SyntaxTree::ExcessedComma,
        parse('foo { |bar,| }').block.block_var.params.rest,
        start_char: 10,
        end_char: 11
      )
    end
  end

  def test_fcall
    assert_node_metadata(
      SyntaxTree::FCall,
      parse('foo(bar)').call,
      start_char: 0,
      end_char: 3
    )
  end

  def test_field
    assert_node_metadata(
      SyntaxTree::Field,
      parse('foo.bar = baz').target,
      start_char: 0,
      end_char: 7
    )
  end

  def test_for
    assert_metadata SyntaxTree::For, <<~SOURCE
      for foo in bar do
        for baz in qux do
        end
      end
    SOURCE
  end

  def test_hash
    assert_metadata SyntaxTree::HashLiteral, <<~SOURCE
      {
        foo: 'bar'
      }
    SOURCE
  end

  def test_if
    assert_metadata SyntaxTree::If, <<~SOURCE
      if foo
        if bar; end
      end
    SOURCE
  end

  def test_ifop
    assert_metadata SyntaxTree::IfOp, 'foo ? bar : baz'
  end

  def test_if_mod
    assert_metadata SyntaxTree::IfMod, 'foo if bar'
  end

  def test_kwrest_param
    assert_node_metadata(
      SyntaxTree::KwRestParam,
      parse('def foo(**bar); end').params.contents.keyword_rest,
      start_char: 8,
      end_char: 13
    )
  end

  def test_lambda
    assert_metadata SyntaxTree::Lambda, <<~SOURCE
      -> (foo, bar) {
        foo + bar
      }
    SOURCE
  end

  def test_massign
    assert_metadata SyntaxTree::MAssign, 'foo, bar, baz = 1, 2, 3'
  end

  def test_method_add_arg
    assert_metadata SyntaxTree::MethodAddArg, 'foo(bar)'
  end

  def test_method_add_block
    assert_metadata SyntaxTree::MethodAddBlock, 'foo { bar }'
  end

  def test_mlhs
    assert_node_metadata(
      SyntaxTree::MLHS,
      parse('foo, bar, baz = 1, 2, 3').target,
      start_char: 0,
      end_char: 13
    )
  end

  def test_mlhs_add_post
    assert_node_metadata(
      SyntaxTree::MLHSAddPost,
      parse('foo, *bar, baz = 1, 2, 3').target,
      start_char: 5,
      end_char: 14
    )
  end

  def test_mlhs_add_star
    assert_node_metadata(
      SyntaxTree::MLHSAddStar,
      parse('foo, *bar = 1, 2, 3').target,
      start_char: 5,
      end_char: 9
    )
  end

  def test_mlhs_paren
    assert_node_metadata(
      SyntaxTree::MLHSParen,
      parse('(foo, bar) = baz').target,
      start_char: 0,
      end_char: 10
    )
  end

  def test_module
    assert_metadata SyntaxTree::ModuleDeclaration, <<~SOURCE
      module Foo
        module Bar; end
      end
    SOURCE
  end

  def test_mrhs_add_star
    assert_node_metadata(
      SyntaxTree::MRHSAddStar,
      parse('foo, bar = *baz').value,
      start_char: 11,
      end_char: 15
    )
  end

  def test_next
    assert_metadata SyntaxTree::Next, 'next foo'
  end

  def test_opassign
    assert_metadata SyntaxTree::OpAssign, 'foo ||= bar'
  end

  def test_params
    content = <<~SOURCE
      def foo(
        bar,
        baz
      ); end
    SOURCE

    assert_node_metadata(
      SyntaxTree::Params,
      parse(content).params.contents,
      start_char: 8,
      end_char: 22,
      start_line: 2,
      end_line: 3
    )
  end

  def test_paren
    assert_metadata SyntaxTree::Paren, '()'
  end

  def test_qsymbols
    assert_node_metadata(
      SyntaxTree::QSymbols,
      parse('%i[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_qwords
    assert_node_metadata(
      SyntaxTree::QWords,
      parse('%w[foo bar baz]').contents,
      start_char: 0,
      end_char: 15
    )
  end

  def test_redo
    assert_metadata SyntaxTree::Redo, 'redo'
  end

  def test_regexp_literal
    assert_metadata SyntaxTree::RegexpLiteral, '/foo/'
    assert_metadata SyntaxTree::RegexpLiteral, '%r{foo}'
    assert_metadata SyntaxTree::RegexpLiteral, '%r(foo)'

    assert_node_metadata(
      SyntaxTree::RegexpLiteral,
      parse('%r(foo)'),
      beginning: '%r(',
      ending: ')',
      start_char: 0,
      end_char: 7
    )
  end

  def test_rescue
    assert_node_metadata(
      SyntaxTree::Rescue,
      parse('begin; foo; rescue => bar; baz; end').bodystmt.rescue_clause,
      start_char: 12,
      end_char: 35
    )
  end

  def test_rescue_mod
    assert_metadata SyntaxTree::RescueMod, 'foo rescue bar'
  end

  def test_rest_param
    assert_node_metadata(
      SyntaxTree::RestParam,
      parse('def foo(*bar); end').params.contents.rest,
      start_char: 8,
      end_char: 12
    )
  end

  def test_retry
    assert_metadata SyntaxTree::Retry, 'retry'
  end

  def test_return
    assert_metadata SyntaxTree::Return, 'return foo'
  end

  def test_return0
    assert_metadata SyntaxTree::Return0, 'return'
  end

  def test_sclass
    assert_metadata SyntaxTree::SClass, <<~SOURCE
      class << Foo
        class << Bar; end
      end
    SOURCE
  end

  def test_string_concat
    assert_metadata SyntaxTree::StringConcat, <<~SOURCE
      'foo' \
        'bar'
    SOURCE
  end

  def test_string_dvar
    assert_node_metadata(
      SyntaxTree::StringDVar,
      parse('"#$foo"').parts.first,
      start_char: 1,
      end_char: 6
    )
  end

  def test_string_embexpr
    assert_node_metadata(
      SyntaxTree::StringEmbExpr,
      parse('"foo #{bar} baz"').parts[1],
      start_char: 5,
      end_char: 11
    )
  end

  def test_string_literal
    assert_metadata SyntaxTree::StringLiteral, '"foo"'
  end

  def test_super
    assert_metadata SyntaxTree::Super, 'super foo'
  end

  def test_symbol_literal
    assert_metadata SyntaxTree::SymbolLiteral, ':foo'
  end

  def test_symbols
    assert_node_metadata(
      SyntaxTree::Symbols,
      parse('%I[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_top_const_field
    assert_node_metadata(
      SyntaxTree::TopConstField,
      parse('::Foo = bar').target,
      start_char: 0,
      end_char: 5
    )
  end

  def test_top_const_ref
    assert_metadata SyntaxTree::TopConstRef, '::Foo'
  end

  def test_unary
    assert_metadata SyntaxTree::Unary, '-foo'
    assert_metadata SyntaxTree::Not, 'not foo'
  end

  def test_undef
    assert_metadata SyntaxTree::Undef, 'undef foo, bar'
  end

  def test_unless
    assert_metadata SyntaxTree::Unless, <<~SOURCE
      unless foo
        unless bar; end
      end
    SOURCE
  end

  def test_unless_mod
    assert_metadata SyntaxTree::UnlessMod, 'foo unless bar'
  end

  def test_until
    assert_metadata SyntaxTree::Until, <<~SOURCE
      until foo
        until bar; end
      end
    SOURCE
  end

  def test_until_mod
    assert_metadata SyntaxTree::UntilMod, 'foo until bar'
  end

  def test_while
    assert_metadata SyntaxTree::While, <<~SOURCE
      while foo
        while bar; end
      end
    SOURCE
  end

  def test_var_alias
    assert_metadata SyntaxTree::VarAlias, 'alias $foo $bar'
  end

  def test_var_field
    assert_node_metadata(
      SyntaxTree::VarField,
      parse('foo = 1').target,
      start_char: 0,
      end_char: 3
    )
  end

  def test_var_ref
    assert_metadata SyntaxTree::VarRef, 'true'
  end

  def test_vcall
    assert_metadata SyntaxTree::VCall, 'foo'
  end

  def test_void_stmt
    assert_node_metadata(
      SyntaxTree::VoidStmt,
      parse('; ;'),
      start_char: 0,
      end_char: 0
    )
  end

  def test_when
    assert_node_metadata(
      SyntaxTree::When,
      parse('case foo; when bar; baz; end').consequent,
      start_char: 10,
      end_char: 28
    )
  end

  def test_while_mod
    assert_metadata SyntaxTree::WhileMod, 'foo while bar'
  end

  def test_words
    assert_node_metadata(
      SyntaxTree::Words,
      parse('%W[f#{o}o b#{a}r b#{a}z]').contents,
      start_char: 0,
      end_char: 24
    )
  end

  def test_xstring
    assert_metadata SyntaxTree::XStringLiteral, <<~SOURCE
      `
        foo
        bar
      `
    SOURCE
  end

  def test_yield
    assert_metadata SyntaxTree::Yield, 'yield foo'
  end

  def test_yield0
    assert_metadata SyntaxTree::Yield0, 'yield'
  end

  def test_zsuper
    assert_metadata SyntaxTree::ZSuper, 'super'
  end

  if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.7')
    def test_args_forward
      content = <<~SOURCE
        def foo(...)
          bar(...)
        end
      SOURCE

      assert_node_metadata(
        SyntaxTree::ArgsForward,
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
        SyntaxTree::AryPtn,
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
        SyntaxTree::In,
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
    SyntaxTree.parse(ruby).statements.body.first
  end
end
