# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.18.2] - 2020-05-01

### Changed

- [@alse] - Support `vscodeLanguageIds` for HAML.
- [@ShayDavidson], [@kddeisz] - Don't allow replacing if/else with ternary if there's an assignment in the predicate.
- [@janklimo] - Do not add an empty line after `rescue` when the block is empty.

## [0.18.1] - 2020-04-05

### Changed

- [@petevk], [@kddeisz] - Use braces for block format iff it was originally a brace block, otherwise you could be changing precedence. For example:

<!-- prettier-ignore -->
```ruby
expect do
  field 1 do
    "foo"
  end
end.to raise_error
```

should maintain its `do...end` and not switch to inline braces otherwise the brace might get associated with the `1`.

- [@flyerhzm] - Rewrite operators binary parser, as in:

<!-- prettier-ignore -->
```ruby
[
  '1111111111111111111111111111111111111111111111111111111111111111111111111',
  222
] +
  [1]
```

- [@ftes], [@kddeisz] - When old-form dynamic attributes are added to a `div` tag in HAML, it was previously skipping printing the `%div`, which led to it being incorrectly displayed.
- [@ftes], [@kddeisz] - Previously if you had a long tag declaration with attributes that made it hit the line limit, then the content of the tag would be pushed to the next line but indented one character too many.
- [@ftes], [@kddeisz] - Don't explicitly require JSON if it has already been loaded, as this can lead to rubygems activation errors.
- [@mmainz], [@kddeisz] - Handle heredocs as the receivers of call nodes, as in:

<!-- prettier-ignore -->
```ruby
foo = <<~TEXT.strip
  bar
TEXT
```

- [@github0013], [@kddeisz] - Leave parentheses in place if the value of a return node contains a binary with low operator precedence, as in:

<!-- prettier-ignore -->
```ruby
return (a or b) if c?
```

## [0.18.0] - 2020-03-17

### Added

- [@kddeisz] - Support for the `nokw_param` node for specifying when methods should no accept keywords, as in:

```ruby
def foo(**nil); end
```

- [@kddeisz] - Support for the `args_forward` node for forwarding all types of arguments, as in:

```ruby
def foo(...)
  bar(...)
end
```

### Changed

- [@ftes], [@kddeisz] - Handled 3 or more classes on a node in HAML, as in:

```haml
%table.table.is-striped.is-hoverable
```

- [@ftes], [@kddeisz] - Better handling of indentation of `if/elsif/else`, `unless/elsif/else`, and `case/when` branches, as in:

```haml
.column.is-12
  - if true
    TRUE
  - else
    FALSE
```

- [@tobyndockerill] - Format numbers with underscores after 4 digits, as opposed to 3.
- [@ianks] - Improve performance by using `--disable-gems`.
- [@flyerhzm] - Calls are grouped such that after an end parenthesis the following call will not be indented, as in:

<!-- prettier-ignore -->
```ruby
Config::Download.new(
  'prettier',
  filename: 'prettier.yml', url: 'https://raw.githubusercontent.com/...'
)
  .perform
```

will now be printed as:

```ruby
Config::Download.new(
  'prettier',
  filename: 'prettier.yml', url: 'https://raw.githubusercontent.com/...'
).perform
```

- [@pje], [@kddeisz] - Method definition bodies (on `defs` nodes) should dedent if a helper method is called. As in:

<!-- prettier-ignore -->
```ruby
private def self.foo
          'bar'
        end
```

should instead be indented as:

<!-- prettier-ignore -->
```ruby
private def self.foo
  'bar'
end
```

- [@masqita], [@kddeisz] - Inline variable assignment within a predicate should force the conditional to break, as in:

```ruby
array.each do |element|
  if index = difference.index(element)
    difference.delete_at(index)
  end
end
```

- [@hafley66], [@kddeisz] - Handle empty `while` and `until` blocks.
- [@Fruetel], [@kddeisz] - Simplify string escape pattern by locking on any escape sequence.
- [@flyerhzm], [@kddeisz] - Properly handle string quotes on symbols in hash keys.

## [0.17.0] - 2019-12-12

### Added

- [@matt-wratt] - Better support for explicit `return` nodes with empty arrays or arrays with a single element.
- [@jrdioko], [@kddeisz] - Alignment of `not_to` is explicitly allowed to not indent to better support rspec.

### Changed

- [@gin0606] - The max buffer being passed into the Ruby process is now up to 10MB.

## [0.16.0] - 2019-11-14

### Added

- [@mmainz], [@kddeisz] - Support for extra commas in multiple assignment, as it changes the meaning. For example,

<!-- prettier-ignore -->
```ruby
a, = [1, 2, 3]
```

would previously get printed as `a = [1, 2, 3]`, which changes the value of `a` from `1` to the value of the entire array.

- [@kddeisz] - Experimental support for the HAMtemplate language.

### Changed

- [@github0013], [@kddeisz] - Support proper string escaping when the original string in the source is wrapped in `%q|...|`. For example, `%q|\'|` should get printed as `"\'"`, where previously it was dropping the backslash.
- [@jamescostian], [@kddeisz] - Force ternary breaking when using the lower-precendence operators `and` and `or`. For example,

<!-- prettier-ignore -->
```ruby
if x.nil?
  puts 'nil' and return
else
  x
end
```

the previous expression was being transformed into a ternary which was invalid ruby. Instead it now stays broken out into an if/else block.

- [@localhostdotdev], [@joeyjoejoejr], [@eins78], [@kddeisz] - Better support for embedded expressions inside heredocs. For example,

<!-- prettier-ignore -->
```ruby
<<-HERE
  foo bar baz
  #{qux}
  foo bar baz
HERE
```

should remain formatted as it is. Whereas previously due to the way the lines were split, you would sometimes end up with it breaking after `#{`.

- [@jamescostian], [@kddeisz] - Fix up `return` node printing. When returning multiple values, you need to return an array literal as opposed to using parentheses.

## [0.15.1] - 2019-11-05

### Changed

- [@AlanFoster] - Add `bin/lex` for viewing the tokenized result of Ripper on Ruby code.
- [@jakeprime], [@kddeisz] - When predicates from within an `if`, `unless`, `while`, or `until` loop break the line, they should be aligned together. For example,

<!-- prettier-ignore -->
```ruby
if foooooo || barrrrrr
  baz
end
```

If the line was set to very short, the binary node should be aligned to 3 spaces from the left of the file (which aligns with the `if`, it would be more for `unless`). So it would look like:

<!-- prettier-ignore -->
```ruby
if foooooo ||
     barrrrrr
  baz
end
```

- [@jamescostian], [@AlanFoster] - Empty `if`, and `unless` conditionals are now handled gracefully:

<!-- prettier-ignore -->
```ruby
if foo?
end
```

- [@mmainz], [@kddeisz] - Hash keys are not converted to keyword syntax if they would make invalid symbols. For example,

<!-- prettier-ignore -->
```ruby
{ :[] => nil }
```

cannot be translated into `[]:` as that is an invalid symbol. Instead, it stays with the hash rocket syntax.

- [@cldevs], [@kddeisz] - Do not attempt to format the insides of xstring literals (string that get sent to the command line surrounded by backticks or `%x`).
- [@cldevs], [@kddeisz] - When predicates for `if`, `unless`, `while`, or `until` nodes contain an assignment, we can't know for sure that it doesn't modify the body. In this case we need to always break and form a multi-line block.
- [@MarcManiez], [@kddeisz] - When the return value of `if`, `unless`, `while`, or `until` nodes are assigned to anything other than a local variable, we need to wrap them in parentheses if we're changing to the modifier form. This is because the following expressions have different semantic meaning:

<!-- prettier-ignore -->
```ruby
hash[:key] = break :value while false
hash[:key] = while false do break :value end
```

The first one will not result in an empty hash, whereas the second one will result in `{ key: nil }`. In this case what we need to do for the first expression to align is wrap it in parens, as in:

<!-- prettier-ignore -->
```ruby
hash[:key] = (break :value while false)
```

That will guarantee that the expressions are equivalent.

- [@AlanFoster] - Fix crashes that were happening with `ignored_nl` nodes.

## [0.15.0] - 2019-08-06

### Changed

- [@dudeofawesome], [@kddeisz] - If xstring literals (command line calls surrounded by backticks) break, then we indent and place the command on a new line. Previously, this was resulting in new lines getting added each time the code was formatted. Now this happens correctly.
- [@krachtstefan], [@kddeisz] - When a `while` or `until` loop modifies a `begin...end` statement, it must remain in the modifier form or else it changes sematic meaning. For example,

<!-- prettier-ignore -->
```ruby
begin
  foo
end while bar
```

cannot be transformed into:

<!-- prettier-ignore -->
```ruby
while bar
  foo
end
```

because that would never execute `foo` if `bar` is falsy, whereas in the initial example it would have.

- [@jviney], [@kddeisz] - When transforming a block into the `Symbol#to_proc` syntax from within a list of arguments inside of an `aref` node (i.e., `foo[:bar].each`), we can't put the block syntax inside the brackets.
- [@jakeprime], [@kddeisz] - Values for the `return` keyword that broke the line were previously just printed as they were, which breaks if you have a block expression like an `if` or `while`. For example,

<!-- prettier-ignore -->
```ruby
return foo ? bar : baz
```

if the line was set to very short would be printed as:

<!-- prettier-ignore -->
```ruby
return if foo
  bar
else
  baz
end
```

which wouldn't work. Instead, they now get printed with parentheses around the value, as in:

<!-- prettier-ignore -->
```ruby
return(
  if foo
    bar
  else
    baz
  end
)
```

- [@jakeprime], [@kddeisz] - When switching from a double-quoted string to a single-quoted string that contained escaped double quotes, the backslashes would stay in the string. As in:

<!-- prettier-ignore -->
```ruby
"Foo \"Bar\" Baz"
```

would get formatted as:

<!-- prettier-ignore -->
```ruby
'Foo \"Bar\" Baz'
```

but now gets formatted as:

<!-- prettier-ignore -->
```ruby
'Foo "Bar" Baz'
```

## [0.14.0] - 2019-07-17

### Added

- [@kddeisz] - Support for pattern matching for variables and array patterns. Currently waiting on Ripper support for hash patterns. For examples, check out the [test/js/patterns.test.js](test/js/patterns.test.js) file.

### Changed

- [@jviney], [@kddeisz] - if/else blocks that had method calls on the end of them that were also transformed into ternaries need to have parens added to them. For example,

<!-- prettier-ignore -->
```ruby
if foo
  1
else
  2
end.to_s
```

now correctly gets transformed into:

<!-- prettier-ignore -->
```ruby
(foo ? 1 : 2).to_s
```

- [@acrewdson], [@kddeisz] - Fixed a bug where multiple newlines at the end of the file would cause a crash.
- [@jviney], [@kddeisz] - If a variable is assigned inside of the predicate of a conditional, then we can't change it into the single-line version as this breaks. For example,

<!-- prettier-ignore -->
```ruby
if foo = 1
  foo
end
```

must stay the same.

## [0.13.0] - 2019-07-05

### Added

- [@kddeisz] - Added `locStart` and `locEnd` functions to support `--cursor-offset`.

### Changed

- [@xipgroc], [@kddeisz] - Comments inside of `do...end` blocks that preceeded `call` nodes were associating the comment with the `var_ref` instead of the `call` itself. For example,

<!-- prettier-ignore -->
```ruby
foo.each do |bar|
  # comment
  bar.baz
  bar.baz
end
```

would get printed as

<!-- prettier-ignore -->
```ruby
foo.each do |bar|
  # comment
  bar
    .baz
  bar.baz
end
```

but now gets printed correctly.

- [@petevk], [@kddeisz] - Double splats inside a hash were previously failing to print. For example,

<!-- prettier-ignore -->
```ruby
{ foo: "bar", **baz }
```

would fail to print, but now works.

## [0.12.3] - 2019-05-16

### Changed

- [@kddeisz] - Move arg, assign, constant, flow, massign, operator, scope, and statement nodes into their own files.
- [@kddeisz] - Move `@int`, `access_ctrl`, `assocsplat`, `block_var`, `else`, `number_arg`, `super`, `undef`, `var_ref`, and `var_ref` as well as various call and symbol nodes into appropriate files.
- [@kddeisz] - Better support for excessed commas in block args. Previously `proc { |x,| }` would add an extra space, but now it does not.
- [@kddeisz] - Add a lot more documentation to the parser.
- [@glejeune], [@kddeisz] - Previously, the unary `not` operator inside a ternary (e.g., `a ? not(b) : c`) would break because it wouldn't add parentheses, but now it adds them.
- [@kddeisz] - `if` and `unless` nodes used to not be able to handle if a comment was the only statement in the body. For example,

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

- [@JoshuaKGoldberg], [@kddeisz] - Fixes an error where `command` nodes within `def` nodes would fail to format if it was only a single block argument. For example,

<!-- prettier-ignore -->
```ruby
def curry(&block)
  new &block
end
```

would fail, but now works.

- [@xipgroc], [@kddeisz] - Comments on lines with array references were previously deleting the array references entirely. For example,

<!-- prettier-ignore -->
```ruby
array[index] # comment
```

would previously result in `array[]`, but now prints properly.

## [0.12.2] - 2019-04-30

### Changed

- [@kddeisz] - When symbol literal hash keys end with `=`, they cannot be transformed into hash labels.
- [@xipgroc], [@kddeisz] - Fixed when blocks on methods with no arguments are transformed into `to_proc` syntax.

## [0.12.1] - 2019-04-22

### Changed

- [@kddeisz] - If a lambda literal is nested under a `command` or `command_call` node anywhere in the heirarchy, then it needs to use the higher-precedence `{ ... }` braces as opposed to the `do ... end` delimiters.
- [@jpickwell], [@kddeisz] - Calling `super` with a block and no args was causing the parser to fail when attempting to inspect lambda nodes.
- [@kddeisz] - Support better breaking within interpolation by grouping the interpolated content.

## [0.12.0] - 2019-04-18

### Added

- [@kddeisz] - Automatically convert `lambda { ... }` method calls into `-> { ... }` literals.

## [0.11.0] - 2019-04-18

### Added

- [@kddeisz] - Support for parsing things with a ruby shebang (e.g., `#!/usr/bin/env ruby` or `#!/usr/bin/ruby`).
- [@kddeisz] - Big tests refactor.
- [@kddeisz] - Make multiple `when` predicates break at 80 chars and then wrap to be inline with the other predicates.
- [@kddeisz] - Automatically add underscores in large numbers that aren't already formatted.
- [@AlanFoster] - Better support for inline access control modifiers.
- [@jpickwell], [@kddeisz] - Better support for heredocs in hash literals.
- [@kddeisz] - Better support for heredocs in array literals.
- [@kddeisz] - Support automatically transforming `def/begin/rescue/end/end` into `def/rescue/end`.

### Changed

- [@deecewan] - Fixed support for dynamic string hash keys.
- [@kddeisz] - Moved `case/when` into its own file and added better documentation.
- [@kddeisz] - Moved `begin/rescue` into its own file.
- [@AlanFoster] - Automatically add newlines around access modifiers.
- [@kddeisz] - Alignment of command calls with arguments is fixed.
- [@aaronjensen], [@kddeisz] - Alignment of `to` is explicitly allowed to not indent to better support rspec.
- [@kddeisz] - Fix up the `to_proc` transform so that it works with other argument handling appropriately.
- [@kddeisz] - Fixed regression on regexp comments.
- [@CodingItWrong], [@kddeisz] - Fix up block delimiters when nested inside a `command` or `command_call` node.
- [@kddeisz] - Moved hashes into its own file.

## [0.10.0] - 2019-03-25

### Added

- [@kddeisz] - Support for block-local variables.
- [@kddeisz] - Support for dyna-symbols that are using single quotes.

### Changed

- [@kddeisz] - Force method calls after arrays, blocks, hashes, and xstrings to hang onto the end of the previous nodes.
- [@kddeisz] - Check before anything else for an invalid ruby version.

## [0.9.1] - 2019-03-24

### Changed

- [@kddeisz] - Better support string quotes by favoring what the user chose if the string contains escape patterns.
- [@kddeisz] - Better support heredocs within method calls.

## [0.9.0] - 2019-03-18

### Added

- [@kddeisz] - Support the `hasPragma` function.
- [@kddeisz] - Support the new `number_arg` node type in Ruby 2.7.

### Changed

- [@kddeisz] - Limit the number of nodes that are allowed to turn into ternary expressions.

## [0.8.0] - 2019-03-08

### Added

- [@kddeisz] - Add `eslint` and fix up existing violations.
- [@AlanFoster] - Add the infra for the `prettier` ruby gem.
- [@kddeisz] - Add a `rake` task for easier process integration for the ruby gem.
- [@kddeisz] - Handle direct interpolation of strings with %w array literals (i.e., `["#{foo}"]` should not be transformed into a %w array).

### Changed

- [@kddeisz] - Fix string escaping for hex digit bit patterns when there's only one character after the "x".
- [@AlanFoster] - Don't allow line breaks between brace block params.
- [@johnschoeman] - Switch over the array.rb test case to minitest.
- [@AlanFoster] - Test improvements to allow running in parallel.
- [@johnschoeman] - Switch over assign.rb test case to minitest.
- [@AlanFoster] - Add a contributing guide.
- [@AlanFoster] - Handle longer command nodes.
- [@kddeisz] - Changed the ruby executable within the `prettier` gem to `rbprettier` for easier autocomplete.

### Removed

- [@kddeisz] - All instances of the spread (`...`) operator so that we can support older versions of node.

## [0.7.0] - 2019-02-24

### Changed

- [@kddeisz] - Support checking for escaping within strings to force double quotes (e.g., "\n").
- [@RossKinsella], [@kddeisz] - Handle cases with empty class and module declarations that need to break.
- [@AlanFoster] - Align the `bin/print` and `bin/sexp` APto support `bin/print` taking a filepath.
- [@AndrewRayCode], [@kddeisz] - Support lambdas that don't break and are inline.
- [@AlanFoster] - Switch over the numbers.rb test to minitest.
- [@AlanFoster] - Switch over the kwargs.rb test to minitest.
- [@AlanFoster] - Bail out early if the Ruby input is invalid.
- [@kddeisz] - Support `__END__` content.
- [@AlanFoster] - Fix up issue with whitespace being added within regexp that are multiline.
- [@AlanFoster] - Better support for destructuring within multi assignment.
- [@kddeisz] - Switch `next` test over to minitest.
- [@kddeisz] - Handle multiple arguments to `next` with a space between.
- [@AndrewRayCode], [@kddeisz] - Handle multi-line conditional predicate (should align with keyword).
- [@aaronjensen], [@kddeisz] - Properly support adding trailing commas with and without blocks.
- [@AlanFoster], [@kddeisz] - Fix regression of handling comments within arrays on array literals.
- [@AlanFoster] - Support multiple arguments to `undef`.

## [0.6.3] - 2019-02-18

### Changed

- [@kddeisz] - Switch over `binary` fixture to minitest.
- [@kddeisz] - Reconfigure parser into multiple layer modules so that it's easier to understand and manage.
- [@kddeisz] - Handle comments from within `begin`, `rescue`, `ensure`, `while`, and `until` nodes.
- [@kddeisz] - Properly indent heredocs without taking into account current indentation level.

## [0.6.2] - 2019-02-17

### Changed

- [@AlanFoster] - Handle regexp suffixes.
- [@kddeisz] - Add support for testing the test fixtures with minitest.
- [@kddeisz] - Switch over `alias` and `regexp` tests to minitest.
- [@aaronjensen], [@kddeisz] - Break up method args to split into multiple lines.
- [@christoomey], [@kddeisz] - Handle blocks args when trailing commas are on.

## [0.6.1] - 2019-02-15

### Changed

- [@meleyal], [@kddeisz] - Fix Ruby 2.5 inline comments on `args_add_block` nodes.
- [@meleyal], [@kddeisz] - Support passing `super()` explicitly with no arguments.

## [0.6.0] - 2019-02-14

### Added

- [@kddeisz] - Handle non UTF-8 comments.
- [@kddeisz] - Handle non UTF-8 identifiers.
- [@kddeisz] - Handle non UTF-8 strings.
- [@kddeisz] - Handle empty parens.
- [@kddeisz] - Handle rescue with splats preceeding the exception names.

### Changed

- [@kddeisz] - Use `JSON::fast_generate` to get the s-expressions back from the parser.
- [@NoahTheDuke], [@kddeisz] - Handle broken lambdas from within `command` and `command_call` nodes.

## [0.5.2] - 2019-02-13

### Changed

- [@kddeisz] - Support embedded expressions within strings that contain only keywords, as in `"#{super}"`.

## [0.5.1] - 2019-02-13

### Changed

- [@yuki24], [@kddeisz] - Force `do` blocks that we know have to be `do` blocks to break.
- [@kmcq], [@kddeisz] - Handle `command` and `command_call` nodes `do` blocks by forcing them to break.
- [@ashfurrow], [@kddeisz] - Attach comments to full hash association nodes, not just the value.

## [0.5.0] - 2019-02-13

### Added

- [@kddeisz] - Automatically convert arrays of all string literals to %w arrays.
- [@kddeisz] - Automatically convert arrays of all symbol literals to %i arrays.

### Changed

- [@kddeisz] - Move the `args_add` and `args_new` handling into the parser.
- [@uri], [@kddeisz] - Change `command_call` nodes to properly indent when broken and to not add a trailing comma.
- [@kddeisz] - Rename the `trailingComma` option to `addTrailingCommas` to not conflict with the JS option.

## [0.4.1] - 2019-02-12

### Changed

- [@kddeisz] - Provide the `makeList` utility for the nodes that are lists from within ripper.
- [@awinograd], [@kddeisz] - Again, this time for real, properly escape strings.
- [@kddeisz] - Fix up trailing commas on command calls.

## [0.4.0] - 2019-02-12

### Added

- [@Overload119], [@kddeisz] - Support the `trailingComma` configuration option (defaults to `false`).

### Changed

- [@NoahTheDuke], [@kddeisz] - Pass the code to be formatted over `stdin`.

## [0.3.7] - 2019-02-11

### Changed

- [@kddeisz] - Split up statements even if they started on the same line with `;`s unless they are within an embedded expression.
- [@kddeisz] - Properly handle escaped quotes within strings.

## [0.3.6] - 2019-02-10

### Changed

- [@AlanFoster], [@kddeisz] - Support the `not` operator properly.
- [@AlanFoster], [@kddeisz] - Handle comments properly inside `if`, `unless`, and `when` nodes.

## [0.3.5] - 2019-02-09

### Changed

- [@kddeisz] - Handle lonely operators in Ruby `2.5`.

## [0.3.4] - 2019-02-09

### Changed

- [@kddeisz] - Comments are now properly attached inside `defs` nodes.
- [@kddeisz] - Support multiple inline comments on nodes.
- [@kddeisz] - Support inline comments from within the `EXPR_END|EXPR_LABEL` lexer state.
- [@cbothner] - Stop transforming multistatement blocks with `to_proc`.
- [@kddeisz] - `do` blocks necessarily need to break their parent nodes.
- [@eins78], [@kddeisz] - Handle `next` node edge case with `args_add` as the body.

## [0.3.3] - 2019-02-09

### Changed

- [@bugthing], [@kddeisz] - Command nodes within conditionals now break parents to disallow them from being turned into ternary expressions.
- [@awinograd], [@kddeisz] - Properly escape double quotes when using `preferSingleQuotes: false`.

## [0.3.2] - 2019-02-09

### Changed

- [@kddeisz] - Don't define duplicated methods in the parser.
- [@kddeisz] - Let prettier know about `.rb` and `.rake` files so you don't have to specify the parser when running.
- [@kddeisz] - Renamed the package to @prettier/plugin-ruby.

## [0.3.1] - 2019-02-07

### Changed

- [@kddeisz] - Automatically add parens to method declarations.
- [@kddeisz] - Handle comments on bare hash assocs.
- [@kddeisz] - Handle `method_add_block` nodes where the statements may be nested one more level.
- [@kddeisz] - Handle heredocs nested no matter how many levels deep.

## [0.3.0] - 2019-02-07

### Added

- [@kddeisz] - Support squiggly heredocs.
- [@kddeisz] - Support straight heredocs.

### Changed

- [@kddeisz] - Ignore current indentation when creating embdocs so that `=begin` is always at the beginning of the line.
- [@kddeisz] - Move `regexp_add` and `regexp_new` handling into the parser.
- [@kddeisz] - Move `xstring_add` and `xstring_new` handling into the parser.
- [@kddeisz] - Move `string_add` and `string_content` handling into the parser.
- [@kddeisz] - Move `mrhs_add` and `mrhs_new` handling into the parser.
- [@kddeisz] - Move `mlhs_add` and `mlhs_new` handling into the parser.

## [0.2.1] - 2019-02-06

### Changed

- [@kddeisz] - Handle brace blocks on commands properly.
- [@kddeisz] - Break parent and return `do` blocks when called from a `command` node.
- [@kddeisz] - Handle edge cases with `if` statements where there is no body of the if (so it can't be converted to a ternary).

## [0.2.0] - 2019-02-06

### Added

- [@kddeisz] - Handle `methref` nodes from Ruby `2.7`.
- [@kddeisz] - Allow `module` nodes to shorten using `;` when the block is empty.

### Changed

- [@kddeisz] - Handle splat within an array, as in `[1, 2, *foo]`.
- [@kddeisz] - Disallow comments from being attached to intermediary regex nodes.
- [@kddeisz] - Fix `to_proc` transforms to reference the method called as opposed to the parameter name.
- [@kddeisz] - Change statement lists to be generated within the parser instead of the printer, thereby allowing finer control over comments.
- [@kddeisz] - Completely revamp comment parsing by switching off the internal lexer state from `ripper`. This should drastically increase accuracy of comment parsing in general, and set us up for success in the future.
- [@kddeisz] - Allow comments to be attached to `CHAR` nodes.
- [@kddeisz] - Disallow comments from being attached to `args_new` nodes.
- [@kddeisz] - Track start and end lines so we can better insert block comments.
- [@kddeisz] - Handle intermediary array nodes in the parse for better comment handling.

## [0.1.2] - 2019-02-05

### Changed

- [@kddeisz] - Handle guard clauses that return with no parens.

## [0.1.1] - 2019-02-05

### Changed

- [@kddeisz] - Handle class method calls with the `::` operator.
- [@kddeisz] - Handle strings with apostrophes when using `preferSingleQuote`.
- [@kddeisz] - Have travis run multiple ruby versions.
- [@kddeisz] - Explicitly fail if ruby version is < `2.5`.
- [@kddeisz] - Disallow comments from being attached to intermediary string nodes.

## [0.1.0] - 2019-02-04

### Added

- Initial release 🎉

[unreleased]: https://github.com/prettier/plugin-ruby/compare/v0.18.2...HEAD
[0.18.2]: https://github.com/prettier/plugin-ruby/compare/v0.18.1...v0.18.2
[0.18.1]: https://github.com/prettier/plugin-ruby/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/prettier/plugin-ruby/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/prettier/plugin-ruby/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/prettier/plugin-ruby/compare/v0.15.1...v0.16.0
[0.15.1]: https://github.com/prettier/plugin-ruby/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/prettier/plugin-ruby/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/prettier/plugin-ruby/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/prettier/plugin-ruby/compare/v0.12.3...v0.13.0
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
[@aaronjensen]: https://github.com/aaronjensen
[@acrewdson]: https://github.com/acrewdson
[@alanfoster]: https://github.com/AlanFoster
[@alse]: https://github.com/alse
[@andrewraycode]: https://github.com/AndrewRayCode
[@ashfurrow]: https://github.com/ashfurrow
[@awinograd]: https://github.com/awinograd
[@bugthing]: https://github.com/bugthing
[@cbothner]: https://github.com/cbothner
[@christoomey]: https://github.com/christoomey
[@cldevs]: https://github.com/cldevs
[@codingitwrong]: https://github.com/CodingItWrong
[@deecewan]: https://github.com/deecewan
[@dudeofawesome]: https://github.com/dudeofawesome
[@eins78]: https://github.com/eins78
[@ftes]: https://github.com/ftes
[@flyerhzm]: https://github.com/flyerhzm
[@fruetel]: https://github.com/Fruetel
[@gin0606]: https://github.com/gin0606
[@github0013]: https://github.com/github0013
[@glejeune]: https://github.com/glejeune
[@hafley66]: https://github.com/hafley66
[@ianks]: https://github.com/ianks
[@jakeprime]: https://github.com/jakeprime
[@jamescostian]: https://github.com/jamescostian
[@janklimo]: https://github.com/janklimo
[@joeyjoejoejr]: https://github.com/joeyjoejoejr
[@johnschoeman]: https://github.com/johnschoeman
[@joshuakgoldberg]: https://github.com/JoshuaKGoldberg
[@jpickwell]: https://github.com/jpickwell
[@jrdioko]: https://github.com/jrdioko
[@jviney]: https://github.com/jviney
[@kddeisz]: https://github.com/kddeisz
[@kmcq]: https://github.com/kmcq
[@krachtstefan]: https://github.com/krachtstefan
[@localhostdotdev]: https://github.com/localhostdotdev
[@marcmaniez]: https://github.com/MarcManiez
[@masqita]: https://github.com/masqita
[@matt-wratt]: https://github.com/matt-wratt
[@meleyal]: https://github.com/meleyal
[@mmainz]: https://github.com/mmainz
[@noahtheduke]: https://github.com/NoahTheDuke
[@overload119]: https://github.com/Overload119
[@petevk]: https://github.com/petevk
[@pje]: https://github.com/pje
[@rosskinsella]: https://github.com/RossKinsella
[@shaydavidson]: https://github.com/ShayDavidson
[@tobyndockerill]: https://github.com/tobyndockerill
[@uri]: https://github.com/uri
[@xipgroc]: https://github.com/xipgroc
[@yuki24]: https://github.com/yuki24
