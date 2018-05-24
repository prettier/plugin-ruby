# prettier-ruby

This is a work in progress plugin for prettier that supports the Ruby programming language. Under the hood it uses the [`ripperjs`](https://github.com/kddeisz/ripperjs) package (which in turn uses Ruby's own `ripper` library) which allows this package to maintain parity with the existing Ruby parser.

## Getting started

Install the dependencies by running `yarn` in the root of the repository. You can then pretty print a ruby source file by running `yarn print [PATH]`.

## Status

There are a lot of node types to support still, as well as tests to write for each. Below is the list of types and their current status.

### Incomplete:

- [ ] BEGIN
- [ ] END
- [ ] alias_error
- [ ] arg_ambiguous
- [ ] assign_error
- [ ] class_name_error
- [ ] command_call
- [ ] excessed_comma
- [ ] heredoc_dedent
- [ ] magic_comment
- [ ] operator_ambiguous
- [ ] param_error
- [ ] parse_error
- [ ] string_dvar
- [ ] var_alias

### Complete:

- [x] alias
- [x] aref
- [x] aref_field
- [x] arg_paren
- [x] args_add
- [x] args_add_block
- [x] args_add_star
- [x] args_new
- [x] array
- [x] assign
- [x] assoc_new
- [x] assoc_splat
- [x] assoclist_from_args
- [x] bare_assoc_hash
- [x] begin
- [x] binary
- [x] block_var
- [x] blockarg
- [x] bodystmt
- [x] brace_block
- [x] break
- [x] call
- [x] case
- [x] class
- [x] command
- [x] const_path_field
- [x] const_path_ref
- [x] const_ref
- [x] def
- [x] defs
- [x] defined
- [x] do_block
- [x] dot2
- [x] dot3
- [x] dyna_symbol
- [x] else
- [x] elsif
- [x] ensure
- [x] fcall
- [x] field
- [x] for
- [x] hash
- [x] if
- [x] if_mod
- [x] ifop
- [x] kwrest_param
- [x] lambda
- [x] massign
- [x] method_add_arg
- [x] method_add_block
- [x] mlhs_add
- [x] mlhs_add_post
- [x] mlhs_add_star
- [x] mlhs_new
- [x] mlhs_paren
- [x] module
- [x] mrhs_add
- [x] mrhs_add_star
- [x] mrhs_new
- [x] mrhs_new_from_args
- [x] next
- [x] opassign
- [x] params
- [x] paren
- [x] program
- [x] qsymbols_add
- [x] qsymbols_new
- [x] qwords_add
- [x] qwords_new
- [x] redo
- [x] regexp_add
- [x] regexp_literal
- [x] regexp_new
- [x] rescue
- [x] rescue_mod
- [x] rest_param
- [x] retry
- [x] return
- [x] return0
- [x] sclass
- [x] stmts_add
- [x] stmts_new
- [x] string_add
- [x] string_concat
- [x] string_content
- [x] string_embexpr
- [x] string_literal
- [x] super
- [x] symbol
- [x] symbol_literal
- [x] symbols_add
- [x] symbols_new
- [x] top_const_field
- [x] top_const_ref
- [x] unary
- [x] undef
- [x] unless
- [x] unless_mod
- [x] until
- [x] until_mod
- [x] var_field
- [x] var_ref
- [x] vcall
- [x] void_stmt
- [x] when
- [x] while
- [x] while_mod
- [x] word_add
- [x] word_new
- [x] words_add
- [x] words_new
- [x] xstring_add
- [x] xstring_literal
- [x] xstring_new
- [x] yield
- [x] yield0
- [x] zsuper
