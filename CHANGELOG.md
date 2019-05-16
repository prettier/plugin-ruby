# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.12.3] - 2019-05-16

### Changed

- [INTERNAL] Move arg, assign, constant, flow, massign, operator, scope, and statement nodes into their own files.
- [INTERNAL] Move `@int`, `access_ctrl`, `assocsplat`, `block_var`, `else`, `number_arg`, `super`, `undef`, `var_ref`, and `var_ref` as well as various call and symbol nodes into appropriate files.
- Better support for excessed commas in block args. Previously `proc { |x,| }` would add an extra space, but now it does not.
- [INTERNAL] Add a lot more documentation to the parser.
- Previously, the unary `not` operator inside a ternary (e.g., `a ? not(b) : c`) would break because it wouldn't add parentheses, but now it adds them. (Thanks to @glejeune for the report.)
- `if` and `unless` nodes used to not be able to handle if a comment was the only statement in the body. For example,

<!-- prettier-ignore -->
```ruby
if foo
  # comment
end
```

would get printed as

<!-- prettier-ignore -->
```ruby
# comment if foo
```

Now the `if` and `unless` printers check for the presence of single comments.

- Fixes an error where `command` nodes within `def` nodes would fail to format if it was only a single block argument. For example,

<!-- prettier-ignore -->
```ruby
def curry(&block)
  new &block
end
```

would fail, but now works. (Thanks to @JoshuaKGoldberg for the report.)

- Comments on lines with array references were previously deleting the array references entirely. For example,

<!-- prettier-ignore -->
```ruby
array[index] # comment
```

would previously result in `array[]`, but now prints properly. (Thanks to @xipgroc for the report.)

## [0.12.2] - 2019-04-30

### Changed

- When symbol literal hash keys end with `=`, they cannot be transformed into hash labels.
- Fixed when blocks on methods with no arguments are transformed into `to_proc` syntax. (Thanks to @xipgroc for the report.)

## [0.12.1] - 2019-04-22

### Changed

- If a lambda literal is nested under a `command` or `command_call` node anywhere in the heirarchy, then it needs to use the higher-precedence `{ ... }` braces as opposed to the `do ... end` delimiters.
- Calling `super` with a block and no args was causing the parser to fail when attempting to inspect lambda nodes. (Thanks to @jpickwell for the report.)
- Support better breaking within interpolation by grouping the interpolated content.

## [0.12.0] - 2019-04-18

### Added

- Automatically convert `lambda { ... }` method calls into `-> { ... }` literals.

## [0.11.0] - 2019-04-18

### Added

- Support for parsing things with a ruby shebang (e.g., `#!/usr/bin/env ruby` or `#!/usr/bin/ruby`).
- [INTERNAL] Big tests refactor.
- Make multiple `when` predicates break at 80 chars and then wrap to be inline with the other predicates.
- Automatically add underscores in large numbers that aren't already formatted.
- Better support for inline access control modifiers. (Thanks for @AlanFoster.)
- Better support for heredocs in hash literals. (Thanks to @jpickwell for the report.)
- Better support for heredocs in array literals.
- Support automatically transforming `def/begin/rescue/end/end` into `def/rescue/end`.

### Changed

- Fixed support for dynamic string hash keys. (Thanks to @deecewan.)
- [INTERNAL] Moved `case/when` into its own file and added better documentation.
- [INTERNAL] Moved `begin/rescue` into its own file.
- Automatically add newlines around access modifiers. (Thanks for @AlanFoster.)
- Alignment of command calls with arguments is fixed.
- Alignment of `to` is explicitly allowed to not indent to better support rspec. (Thanks to @aaronjensen for the report.)
- Fix up the `to_proc` transform so that it works with other argument handling appropriately.
- Fixed regression on regexp comments.
- Fix up block delimiters when nested inside a `command` or `command_call` node. (Thanks to @CodingItWrong for the report.)
- [INTERNAL] Moved hashes into its own file.

## [0.10.0] - 2019-03-25

### Added

- Support for block-local variables.
- Support for dyna-symbols that are using single quotes.

### Changed

- Force method calls after arrays, blocks, hashes, and xstrings to hang onto the end of the previous nodes.
- Check before anything else for an invalid ruby version.

## [0.9.1] - 2019-03-24

### Changed

- Better support string quotes by favoring what the user chose if the string contains escape patterns.
- Better support heredocs within method calls.

## [0.9.0] - 2019-03-18

### Added

- Support the `hasPragma` function.
- Support the new `number_arg` node type in Ruby 2.7.

### Changed

- Limit the number of nodes that are allowed to turn into ternary expressions.

## [0.8.0] - 2019-03-08

### Added

- [INTERNAL] Add `eslint` and fix up existing violations.
- Add the infra for the `prettier` ruby gem. (Thanks to @AlanFoster.)
- Add a `rake` task for easier process integration for the ruby gem.
- Handle direct interpolation of strings with %w array literals (i.e., `["#{foo}"]` should not be transformed into a %w array).

### Changed

- Fix string escaping for hex digit bit patterns when there's only one character after the "x".
- Don't allow line breaks between brace block params. (Thanks to @AlanFoster.)
- [INTERNAL] Switch over the array.rb test case to minitest. (Thanks to @johnschoeman.)
- [INTERNAL] Test improvements to allow running in parallel. (Thanks to @AlanFoster.)
- [INTERNAL] Switch over assign.rb test case to minitest. (Thanks to @johnschoeman.)
- [INTERNAL] Add a contributing guide. (Thanks to @AlanFoster.)
- Handle longer command nodes. (Thanks to @AlanFoster.)
- Changed the ruby executable within the `prettier` gem to `rbprettier` for easier autocomplete.

### Removed

- All instances of the spread (`...`) operator so that we can support older versions of node.

## [0.7.0] - 2019-02-24

### Changed

- Support checking for escaping within strings to force double quotes (e.g., "\n").
- Handle cases with empty class and module declarations that need to break. (Thanks to @RossKinsella for the report.)
- [INTERNAL] Align the `bin/print` and `bin/sexp` API to support `bin/print` taking a filepath. (Thanks to @AlanFoster.)
- Support lambdas that don't break and are inline. (Thanks to @AndrewRayCode for the report.)
- [INTERNAL] Switch over the numbers.rb test to minitest. (Thanks to @AlanFoster.)
- [INTERNAL] Switch over the kwargs.rb test to minitest. (Thanks to @AlanFoster.)
- [INTERNAL] Bail out early if the Ruby input is invalid. (Thanks to @AlanFoster.)
- Support `__END__` content.
- Fix up issue with whitespace being added within regexp that are multiline. (Thanks to @AlanFoster.)
- Better support for destructuring within multi assignment. (Thanks to @AlanFoster.)
- [INTERNAL] Switch `next` test over to minitest.
- Handle multiple arguments to `next` with a space between.
- Handle multi-line conditional predicate (should align with keyword). (Thanks to @AndrewRayCode for the report.)
- Properly support adding trailing commas with and without blocks. (Thanks to @aaronjensen for the report.)
- Fix regression of handling comments within arrays on array literals. (Thanks to @AlanFoster for the report.)
- Support multiple arguments to `undef`. (Thanks to @AlanFoster.)

## [0.6.3] - 2019-02-18

### Changed

- [INTERNAL] Switch over `binary` fixture to minitest.
- [INTERNAL] Reconfigure parser into multiple layer modules so that it's easier to understand and manage.
- Handle comments from within `begin`, `rescue`, `ensure`, `while`, and `until` nodes.
- Properly indent heredocs without taking into account current indentation level.

## [0.6.2] - 2019-02-17

### Changed

- Handle regexp suffixes. (Thanks to @AlanFoster.)
- [INTERNAL] Add support for testing the test fixtures with minitest.
- [INTERNAL] Switch over `alias` and `regexp` tests to minitest.
- Break up method args to split into multiple lines. (Thanks to @aaronjensen for the report.)
- Handle blocks args when trailing commas are on. (Thanks to @christoomey for the report.)

## [0.6.1] - 2019-02-15

### Changed

- Fix Ruby 2.5 inline comments on `args_add_block` nodes. (Thanks to @meleyal for the report.)
- Support passing `super()` explicitly with no arguments. (Thanks to @meleyal for the report.)

## [0.6.0] - 2019-02-14

### Added

- Handle non UTF-8 comments.
- Handle non UTF-8 identifiers.
- Handle non UTF-8 strings.
- Handle empty parens.
- Handle rescue with splats preceeding the exception names.

### Changed

- Use `JSON::fast_generate` to get the s-expressions back from the parser.
- Handle broken lambdas from within `command` and `command_call` nodes. (Thanks to @NoahTheDuke for the report.)

## [0.5.2] - 2019-02-13

### Changed

- Support embedded expressions within strings that contain only keywords, as in `"#{super}"`.

## [0.5.1] - 2019-02-13

### Changed

- Force `do` blocks that we know have to be `do` blocks to break. (Thanks to @yuki24 for the report.)
- Handle `command` and `command_call` nodes `do` blocks by forcing them to break. (Thanks to @kmcq for the report.)
- Attach comments to full hash association nodes, not just the value. (Thanks to @ashfurrow for the report.)

## [0.5.0] - 2019-02-13

### Added

- Automatically convert arrays of all string literals to %w arrays.
- Automatically convert arrays of all symbol literals to %i arrays.

### Changed

- [INTERNAL] Move the `args_add` and `args_new` handling into the parser.
- Change `command_call` nodes to properly indent when broken and to not add a trailing comma. (Thanks to @uri for the report.)
- Rename the `trailingComma` option to `addTrailingCommas` to not conflict with the JS option.

## [0.4.1] - 2019-02-12

### Changed

- [INTERNAL] Provide the `makeList` utility for the nodes that are lists from within ripper.
- Again, this time for real, properly escape strings. (Thanks to @awinograd for the report.)
- Fix up trailing commas on command calls.

## [0.4.0] - 2019-02-12

### Added

- Support the `trailingComma` configuration option (defaults to `false`). (Thanks to @Overload119 for the request.)

### Changed

- Pass the code to be formatted over `stdin`. (Thanks to @NoahTheDuke for the report.)

## [0.3.7] - 2019-02-11

### Changed

- Split up statements even if they started on the same line with `;`s unless they are within an embedded expression.
- Properly handle escaped quotes within strings.

## [0.3.6] - 2019-02-10

### Changed

- Support the `not` operator properly. (Thanks to @AlanFoster for the report.)
- Handle comments properly inside `if`, `unless`, and `when` nodes. (Thanks to @AlanFoster for the report.)

## [0.3.5] - 2019-02-09

### Changed

- Handle lonely operators in Ruby `2.5`.

## [0.3.4] - 2019-02-09

### Changed

- Comments are now properly attached inside `defs` nodes.
- Support multiple inline comments on nodes.
- Support inline comments from within the `EXPR_END|EXPR_LABEL` lexer state.
- Stop transforming multistatement blocks with `to_proc`. (Thanks to @cbothner.)
- `do` blocks necessarily need to break their parent nodes.
- Handle `next` node edge case with `args_add` as the body. (Thanks to @eins78 for the report.)

## [0.3.3] - 2019-02-09

### Changed

- Command nodes within conditionals now break parents to disallow them from being turned into ternary expressions. (Thanks to @bugthing for the report.)
- Properly escape double quotes when using `preferSingleQuotes: false`. (Thanks to @awinograd for the report.)

## [0.3.2] - 2019-02-09

### Changed

- [INTERNAL] Don't define duplicated methods in the parser.
- Let prettier know about `.rb` and `.rake` files so you don't have to specify the parser when running.
- Renamed the package to @prettier/plugin-ruby.

## [0.3.1] - 2019-02-07

### Changed

- Automatically add parens to method declarations.
- Handle comments on bare hash assocs.
- Handle `method_add_block` nodes where the statements may be nested one more level.
- Handle heredocs nested no matter how many levels deep.

## [0.3.0] - 2019-02-07

### Added

- Support squiggly heredocs.
- Support straight heredocs.

### Changed

- Ignore current indentation when creating embdocs so that `=begin` is always at the beginning of the line.
- [INTERNAL] Move `regexp_add` and `regexp_new` handling into the parser.
- [INTERNAL] Move `xstring_add` and `xstring_new` handling into the parser.
- [INTERNAL] Move `string_add` and `string_content` handling into the parser.
- [INTERNAL] Move `mrhs_add` and `mrhs_new` handling into the parser.
- [INTERNAL] Move `mlhs_add` and `mlhs_new` handling into the parser.

## [0.2.1] - 2019-02-06

### Changed

- Handle brace blocks on commands properly.
- Break parent and return `do` blocks when called from a `command` node.
- Handle edge cases with `if` statements where there is no body of the if (so it can't be converted to a ternary).

## [0.2.0] - 2019-02-06

### Added

- Handle `methref` nodes from Ruby `2.7`.
- Allow `module` nodes to shorten using `;` when the block is empty.

### Changed

- Handle splat within an array, as in `[1, 2, *foo]`.
- Disallow comments from being attached to intermediary regex nodes.
- Fix `to_proc` transforms to reference the method called as opposed to the parameter name.
- [INTERNAL] Change statement lists to be generated within the parser instead of the printer, thereby allowing finer control over comments.
- [INTERNAL] Completely revamp comment parsing by switching off the internal lexer state from `ripper`. This should drastically increase accuracy of comment parsing in general, and set us up for success in the future.
- Allow comments to be attached to `CHAR` nodes.
- [INTERNAL] Disallow comments from being attached to `args_new` nodes.
- [INTERNAL] Track start and end lines so we can better insert block comments.
- [INTERNAL] Handle intermediary array nodes in the parse for better comment handling.

## [0.1.2] - 2019-02-05

### Changed

- Handle guard clauses that return with no parens.

## [0.1.1] - 2019-02-05

### Changed

- Handle class method calls with the `::` operator.
- Handle strings with apostrophes when using `preferSingleQuote`.
- [INTERAL] Have travis run multiple ruby versions.
- Explicitly fail if ruby version is < `2.5`.
- Disallow comments from being attached to intermediary string nodes.

## [0.1.0] - 2019-02-04

### Added

- Initial release 🎉

[unreleased]: https://github.com/prettier/plugin-ruby/compare/v0.12.3...HEAD
[0.12.3]: https://github.com/prettier/plugin-ruby/compare/v0.12.2...v0.12.3
[0.12.2]: https://github.com/prettier/plugin-ruby/compare/v0.12.1...v0.12.2
[0.12.1]: https://github.com/prettier/plugin-ruby/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/prettier/plugin-ruby/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/prettier/plugin-ruby/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/prettier/plugin-ruby/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/prettier/plugin-ruby/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/prettier/plugin-ruby/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/prettier/plugin-ruby/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/prettier/plugin-ruby/compare/v0.6.3...v0.7.0
[0.6.3]: https://github.com/prettier/plugin-ruby/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/prettier/plugin-ruby/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/prettier/plugin-ruby/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/prettier/plugin-ruby/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/prettier/plugin-ruby/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/prettier/plugin-ruby/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/prettier/plugin-ruby/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/prettier/plugin-ruby/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/prettier/plugin-ruby/compare/v0.3.7...v0.4.0
[0.3.7]: https://github.com/prettier/plugin-ruby/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/prettier/plugin-ruby/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/prettier/plugin-ruby/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/prettier/plugin-ruby/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/prettier/plugin-ruby/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/prettier/plugin-ruby/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/prettier/plugin-ruby/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/prettier/plugin-ruby/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/prettier/plugin-ruby/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/prettier/plugin-ruby/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/prettier/plugin-ruby/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/prettier/plugin-ruby/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/prettier/plugin-ruby/compare/61f675...v0.1.0
