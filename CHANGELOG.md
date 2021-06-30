# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.1] - 2021-06-30

### Changed

- [#862](https://github.com/prettier/plugin-ruby/issues/862) - azz, kddeisz - Group together `.where.not` calls in method chains.
- [#863](https://github.com/prettier/plugin-ruby/issues/863) - azz, kddeisz - Fix up Sorbet `sig` block formatting when chaining method calls.
- [#908](https://github.com/prettier/plugin-ruby/issues/908) - Hansenq, kddeisz - Method chains with blocks should be properly indented.
- [#916](https://github.com/prettier/plugin-ruby/issues/916) - pbrisbin, kddeisz - Ensure all of the necessary files are present in the gem.
- [#917](https://github.com/prettier/plugin-ruby/issues/917) - jscheid, kddeisz - Ensure hash keys with dynamic symbols don't strip their quotes.

## [1.6.0] - 2021-06-23

### Added

- [#859](https://github.com/prettier/plugin-ruby/issues/859) - azz, kddeisz - Support the `--insert-pragma` option for the incremental adoption workflow.
- [#904](https://github.com/prettier/plugin-ruby/issues/904) - Hansenq, kddeisz - Support the `%s` symbol literal syntax.
- [#833](https://github.com/prettier/plugin-ruby/issues/883) - kddeisz - Support for prettier >= v2.3.0.

### Changed

- [#854](https://github.com/prettier/plugin-ruby/issues/854) - jflinter, kddeisz - Parentheses should not be stripped from optional RBS union types.
- [#888](https://github.com/prettier/plugin-ruby/issues/888) - MaxNotarangelo, kddeisz - Ensure parentheses wrap conditionals that get transformed into the modifier form when they're used within a binary node.
- [#874](https://github.com/prettier/plugin-ruby/issues/874) - yratanov, kddeisz - Ensure that method calls chained onto the ends of blocks still print their arguments.
- [#897](https://github.com/prettier/plugin-ruby/pull/897) - Hansenq - Reenable the `Layout/LineLength` rubocop rule in our shipped config so that line lengths for other cops are calculated correctly.

## [1.5.5] - 2021-03-25

### Changed

- [#841](https://github.com/prettier/plugin-ruby/issues/841) - LoganBarnett, kddeisz - Better error messaging for when unix sockets are not supported by netcat.
- [#844](https://github.com/prettier/plugin-ruby/issues/844) - andyw8, kddeisz - Ensure we ship all of the parsers with the prettier gem so that `rbprettier` can parse other languages as well.
- [#847](https://github.com/prettier/plugin-ruby/issues/847) - jflinter, kddeisz - Ensure parentheses are present on union return types in RBS.
- [#850](https://github.com/prettier/plugin-ruby/issues/850) - maethub, kddeisz - Ensure double quotes are used even when single quotes are requested for HAML attribute values.
- [#849](https://github.com/prettier/plugin-ruby/issues/849) - indirect, kddeisz - Support HAML version <= 5.1 multi-line attributes.
- [#810](https://github.com/prettier/plugin-ruby/issues/810) - valscion, kddeisz - Make it so that brace blocks containing heredocs have the correct end line so that they format subsequent statements correctly.

## [1.5.4] - 2021-03-17

### Changed

- [#835](https://github.com/prettier/plugin-ruby/issues/835) - valscion, kddeisz - Array splat operator should not get moved by leading comments.
- [#836](https://github.com/prettier/plugin-ruby/issues/836) - valscion, kddeisz - Array splat operator should not get moved by trailing comments.
- [#821](https://github.com/prettier/plugin-ruby/issues/821) - jscheid, kddeisz - Better error handling when using GNU netcat.

## [1.5.3] - 2021-02-28

### Changed

- [#812](https://github.com/prettier/plugin-ruby/issues/812) - valscion, kddeisz - Splats and blocks within args that have comments attached should place their respective operators in the right place.
- [#816](https://github.com/prettier/plugin-ruby/pull/816) - valscion - Document RuboCop's Style/Lambda should be disabled
- [#814](https://github.com/prettier/plugin-ruby/issues/814) - jscheid, kddeisz - Provide better errors when the source location of the error is known.

## [1.5.2] - 2021-02-03

### Changed

- kddeisz - Fix up `binary` node comparison operators so that it will handle either Symbol literals or the `@op` nodes which are incorrectly coming from JRuby (https://github.com/jruby/jruby/issues/6548).

## [1.5.1] - 2021-01-27

### Changed

- [#799](https://github.com/prettier/plugin-ruby/issues/799) - jscheid, kddeisz - Multi-byte characters shouldn't give invalid source string bounds.
- [#801](https://github.com/prettier/plugin-ruby/issues/801) - jscheid, kddeisz - When converting a conditional to the modifier form, make sure to add parentheses if there is a chained method call.
- [#803](https://github.com/prettier/plugin-ruby/issues/803) - jscheid, kddeisz - Fix `formatWithCursor` support to match new parser format.

## [1.5.0] - 2021-01-21

### Added

- kddeisz - Add `.rbi` as a file type that we support.

### Changed

- [#795](https://github.com/prettier/plugin-ruby/issues/795) djrodgerspryor, kddeisz - Trailing comments attached to empty arrays should not multiply.
- [#794](https://github.com/prettier/plugin-ruby/issues/794) djrodgerspryor, kddeisz - Fix embedded parser parsing by stripping common leading whitespace before passing on the content.
- [#793](https://github.com/prettier/plugin-ruby/issues/793) djrodgerspryor, kddeisz - Do not include trailing commas on arguments within `arg_paren` nodes if they could not be parsed with them (`command` and `command_call`).
- [#788](https://github.com/prettier/plugin-ruby/issues/788) clarkdave, kddeisz - Break child hashes within a multi-line hash regardless of whether or not they can fit on one line.
- kddeisz - Stop using `;` to separate empty class definitions, module definitions, and loops.

## [1.4.0] - 2021-01-15

### Added

- ianks, kddeisz - Use `netcat` to communicate to a parser server for better performance when formatting multiple files.

### Changed

- jeffcarbs, kddeisz - Long strings with interpolated expressions should only break if the contents in the original source is broken.
- johannesluedke, kddeisz - Fix for rescues with inline comments.
- johncsnyder, kddeisz - Comments should not attach to nodes beyond a double newline.
- blampe, kddeisz - Comments inside of a broken method chain get dropped.
- clarkdave, kddeisz - Don't ignore Sorbet `sig` transformations.

## [1.3.0] - 2021-01-05

### Added

- kddeisz - Handling of the RBS language.
- kddeisz - Incorporate the HAML plugin.

## [1.2.5] - 2021-01-04

### Changed

- nruth, kddeisz - Ensure unary operators on method calls that are sending operators get the correct scanner events.
- cvoege, kddeisz - Do not add parentheses when they're not needed to non-breaking command_calls with ternary arguments.
- valscion, kddeisz - Print method chains more nicely off array and hash literals.

## [1.2.4] - 2021-01-03

### Added

- andyw8 - Explain usage with Rubocop, as well as shipping a rubocop.yml config.

### Changed

- kddeisz - Reduce JSON size passing from Ruby process to node process by changing `char_start` -> `sc`, `char_end` -> `ec`, `start` -> `sl`, `end` -> `el`.
- kddeisz - Up the max buffer size between the Ruby and node processes to 15K.

## [1.2.3] - 2021-01-02

### Changed

- lukyth, kddeisz - Ensure if a ternary breaks into an `if..else..end` within a `command_call` node that parentheses are added.
- AlanFoster, kddeisz - Ensure you consume the optional `do` keyword on `while` and `until` loops so that it doesn't confuse the parser.
- AlanFoster, kddeisz - Ensure key-value pairs split on line when the key has a comment attached within a hash.
- AlanFoster, kddeisz - Fix for `for` loops that have multiple index variables.
- AlanFoster, kddeisz - Fix parsing very large files by reducing the size of the JSON output from the parser.
- AlanFoster, kddeisz - Ensure you don't skip parentheses if you're returning a value with the `not` unary operator.

## [1.2.2] - 2021-01-01

### Changed

- nathan-beam - Gem does not work with CMD/Powershell.
- blampe, kddeisz - Comments inside keyword parameters in method declarations are not printed.
- blampe, kddeisz - `command_call` nodes with unary operators incorrectly parse their operator.
- blampe, kddeisz - Returning multiple values where the first has parentheses was incorrectly removing the remaining values.
- johncsnyder, kddeisz - Call chains whose left-most receiver is a no-indent expression should not indent their entire chain.

## [1.2.1] - 2020-12-27

### Changed

- kddeisz - Handle single-line method definitions with parameters.
- kddeisz - Handle hash and array patterns nested within find patterns.
- kddeisz - Handle rightward assignment.
- kddeisz - Handle find patterns with named boundaries.
- kddeisz - Handle rightward assignment in conditionals.

## [1.2.0] - 2020-12-26

### Added

- kddeisz - Support for the `fndptn` node for Ruby 3.0 pattern matching.
- kddeisz - Support for Ruby 3.0+ single-line method definitions.

## [1.1.0] - 2020-12-20

### Added

- kddeisz - Now that the comments are all fixed up, we can support `# prettier-ignore` comments.

### Changed

- rindek, kddeisz - Do not remove parentheses when receiver looks like a constant.
- rindek, kddeisz - Do not remove parentheses when using the special `call` syntax with no arguments.
- ykpythemind - Do not change regexp bounds if the body has certain content.
- karanmandal, kddeisz - Correctly print for loops.
- rafbm, kddeisz - If there are method chains with arguments only at the end, we should group the method chain and the method args.

## [1.0.1] - 2020-12-12

### Changed

- steobrien, kddeisz - Ensure leading comments in empty array and hash literals do not duplicate.

## [1.0.0] - 2020-12-11

### Changed

- kddeisz - Do not unescape double quotes in a single quote string.
- kddeisz - Only force braces on regexp for spaces and equals if it's inside a command or command_call.
- kddeisz - Leave Sorbet type annotations in place.
- kddeisz - Don't group hash contents, just allow them to break with their parent node.
- kddeisz - Honor the UTF-8 lang passed in through ENV vars.

## [1.0.0-rc2] - 2020-12-10

### Changed

- kddeisz - Print hashes with consistent keys (e.g., if one key cannot be a hash label, use all hash rockets).
- kddeisz - Respect using `o` or not using `o` for octal numbers.
- kddeisz - Ensure `when` clauses with multiple predicates that can be split into multiple lines are split correctly.
- kddeisz - Ensure hash literal is split correctly when only its contents would fit on one line.
- kddeisz - Simplify `toProc` checks by not calling if the option is disabled.
- johncsnyder, kddeisz - Add `method_add_block` to the potential like of method calls that can be chained.
- kddeisz - Add the `rubyArrayLiteral` option for disabling automatically turning into array literals.

## [1.0.0-rc1] - 2020-12-09

### Changed

- kddeisz - Rename options to prep for v1.0 release.
  - `addTrailingCommas` -> `trailingComma`, `"es5"` means `true`
  - `inlineConditionals` and `inlineLoops` -> `rubyModifier`
  - `preferHashLabels` -> `rubyHashLabel`
  - `preferSingleQuotes` -> `rubySingleQuote`
  - `toProcTransform` -> `rubyToProc`
- andyw8, kddeisz - Fix for Ruby `2.5.1` dyna_symbols. Turns out they were previously incorrectly reported as `xstring` nodes.
- andyw8, kddeisz - Fix for plain `rescue` nodes with only comments in the body.
- andyw8, kddeisz - Move declaration-type comments up to the line in the original source, as in:

```ruby
def foo # :nodoc:
  bar
end
```

The comment in the above example should stay in place.

- janklimo - Respect special call syntax, e.g., `a.(1, 2, 3)` should remain the same.
- kddeisz - Fix up a bug with `ensure` being used in a `bodystmt` and not a `begin`.
- kddeisz - Fix up a bug with negative ranges, e.g., `-4..-3`.
- kddeisz - Fix up a bug with operator aliases, e.g., `alias << push`.
- kddeisz - Fix up a bug with calls and unary nodes, e.g., `!!foo&.bar`.
- kddeisz - Fix up a bug with multiple rescue clauses and comments, e.g.,

```ruby
begin

rescue Foo, Bar
  # comment
end
```

- kddeisz - Handle string literals that start with `%Q`.
- kddeisz - Handle question method methods in the predicate of an if with a comment in the body.
- kddeisz - Fix bare `break` with comments immediately after.
- kddeisz - Fix for heredocs with comments immediately after the declaration.
- kddeisz - Fix for comments when you're defining a method whose name overlaps with a keyword.
- kddeisz - Don't automatically indent inside interpolated expressions from within a heredoc.
- kddeisz - Don't convert into string literal arrays if the elements have brackets.
- kddeisz - Ensure you break the parent when there is an assignment in the predicate of a loop.
- kddeisz - Fix up a bug with keyword aliases, e.g., `alias in within`.
- kddeisz - Force using braces for regex if a regex starts with a blank space.
- kddeisz - Force using braces for regex if a regex starts with an equals sign.
- kddeisz - Fix up a bug with constant aliases, e.g., `alias in IN`.
- andyw8, kddeisz - Ensure `rescue` comments stay on the same line as their declaration.

## [0.22.0] - 2020-12-08

### Changed

- flyerhzm - Print method chains by one indentation.
- mmcnl, kddeisz - Handle heredocs and blocks being passed to the same method.
- johncsnyder, kddeisz - Ensure correct formatting when breaking up conditionals with `inlineConditionals: false`.
- Rsullivan00 - Ensure that when ternaries as command arguments get broken into multiple lines we add the necessary parentheses.
- jbielick - Maintain parse order during if/unless modifier expressions
- flyerhzm - Slight prettifying of wrapped args if doc length is under a certain value.
- github0013, kddeisz - Ensure `not` keeps parentheses if they are being used.
- jbielick - Print heredocs consistently.
- kddeisz - Completely revamp the way we handle comments.
- kddeisz - Support `hshptn` and the remaining missing pattern matching syntax.

## [0.21.0] - 2020-12-02

### Changed

- kddeisz, ryan-hunter-pc - Explicitly handle `break` and `next` keyword parentheses.
- jbielick, kddeisz - Don't convert between `lambda {}` and `-> {}`. Technically it's breaking the semantics of the program. Also because lambda method call arguments can't handle everything that stabby lambda can.
- kddeisz - Turn off the `Symbol#to_proc` transform by default.
- janklimo, kddeisz - Properly handle trailing commas on hash arguments.
- coiti, kddeisz - Properly handle parentheses when necessary on if/unless statements and while/until loops.
- Rsullivan00 - Prevent `command` and `command_call` nodes from being turned into ternaries.
- kddeisz - Better handling of the `alias` node with and without comments.
- kddeisz - Better handling of the `BEGIN` and `END` nodes with and without comments.
- kddeisz - Much better handling of heredocs where now there is a consistent `heredoc` node instead of multiple.

## [0.20.1] - 2020-09-04

### Changed

- ftes, kddeisz - Properly escape HAML plain text statements that start with special HAML characters.

### Removed

- kddeisz - I'm stripping out the HAML plugin and putting it into its own package (`@prettier/plugin-haml`). It's become too difficult to maintain within this repo, and it's confusing for contributors because there are some things that work with Ruby and some things that don't. This is going to simplify maintenance. This should probably be a major version bump but since we're still pre `1.0` I'm going to leave it as a patch.

## [0.20.0] - 2020-08-28

### Added

- kddeisz - Allow embedded formatting on heredocs by the name placed at the start. For example,

<!-- prettier-ignore -->
```ruby
javascript = <<~JAVASCRIPT
  const a=1;
  const b=2;
  return a+b;
JAVASCRIPT
```

### Changed

- mmainz - Fix the encoding setting such that we're not overwriting the entire set of environment variables.

## [0.19.1] - 2020-08-21

### Changed

- Rsullivan00 - Do not tranform word-literal arrays when there is an escape sequence.
- steobrien, kddeisz - Do not indent heredocs with calls more than they should be.
- jpickwell - Include .simplecov in filenames
- github0013, kddeisz - Ensure we're parsing ruby files using UTF-8 regardless of the system encoding.

## [0.19.0] - 2020-07-03

### Added

- ryan-hunter-pc - Add the option to disable the `Symbol#to_proc` transform.
- ryan-hunter-pc], [@SViccari, kddeisz - Disable `Symbol#to_proc` transform when used as a key inside of a hash where the key is either `:if` or `:unless`.

## [0.18.2] - 2020-05-01

### Changed

- alse - Support `vscodeLanguageIds` for HAML.
- ShayDavidson, kddeisz - Don't allow replacing if/else with ternary if there's an assignment in the predicate.
- janklimo - Do not add an empty line after `rescue` when the block is empty.

## [0.18.1] - 2020-04-05

### Changed

- petevk, kddeisz - Use braces for block format iff it was originally a brace block, otherwise you could be changing precedence. For example:

<!-- prettier-ignore -->
```ruby
expect do
  field 1 do
    "foo"
  end
end.to raise_error
```

should maintain its `do...end` and not switch to inline braces otherwise the brace might get associated with the `1`.

- flyerhzm - Rewrite operators binary parser, as in:

<!-- prettier-ignore -->
```ruby
[
  '1111111111111111111111111111111111111111111111111111111111111111111111111',
  222
] +
  [1]
```

- ftes, kddeisz - When old-form dynamic attributes are added to a `div` tag in HAML, it was previously skipping printing the `%div`, which led to it being incorrectly displayed.
- ftes, kddeisz - Previously if you had a long tag declaration with attributes that made it hit the line limit, then the content of the tag would be pushed to the next line but indented one character too many.
- ftes, kddeisz - Don't explicitly require JSON if it has already been loaded, as this can lead to rubygems activation errors.
- mmainz, kddeisz - Handle heredocs as the receivers of call nodes, as in:

<!-- prettier-ignore -->
```ruby
foo = <<~TEXT.strip
  bar
TEXT
```

- github0013, kddeisz - Leave parentheses in place if the value of a return node contains a binary with low operator precedence, as in:

<!-- prettier-ignore -->
```ruby
return (a or b) if c?
```

## [0.18.0] - 2020-03-17

### Added

- kddeisz - Support for the `nokw_param` node for specifying when methods should no accept keywords, as in:

```ruby
def foo(**nil); end
```

- kddeisz - Support for the `args_forward` node for forwarding all types of arguments, as in:

```ruby
def foo(...)
  bar(...)
end
```

### Changed

- ftes, kddeisz - Handled 3 or more classes on a node in HAML, as in:

```haml
%table.table.is-striped.is-hoverable
```

- ftes, kddeisz - Better handling of indentation of `if/elsif/else`, `unless/elsif/else`, and `case/when` branches, as in:

```haml
.column.is-12
  - if true
    TRUE
  - else
    FALSE
```

- tobyndockerill - Format numbers with underscores after 4 digits, as opposed to 3.
- ianks - Improve performance by using `--disable-gems`.
- flyerhzm - Calls are grouped such that after an end parenthesis the following call will not be indented, as in:

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
  filename: 'prettier.yml',
  url: 'https://raw.githubusercontent.com/...'
).perform
```

- pje, kddeisz - Method definition bodies (on `defs` nodes) should dedent if a helper method is called. As in:

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

- masqita, kddeisz - Inline variable assignment within a predicate should force the conditional to break, as in:

```ruby
array.each do |element|
  if index = difference.index(element)
    difference.delete_at(index)
  end
end
```

- hafley66, kddeisz - Handle empty `while` and `until` blocks.
- Fruetel, kddeisz - Simplify string escape pattern by locking on any escape sequence.
- flyerhzm, kddeisz - Properly handle string quotes on symbols in hash keys.

## [0.17.0] - 2019-12-12

### Added

- matt-wratt - Better support for explicit `return` nodes with empty arrays or arrays with a single element.
- jrdioko, kddeisz - Alignment of `not_to` is explicitly allowed to not indent to better support rspec.

### Changed

- gin0606 - The max buffer being passed into the Ruby process is now up to 10MB.

## [0.16.0] - 2019-11-14

### Added

- mmainz, kddeisz - Support for extra commas in multiple assignment, as it changes the meaning. For example,

<!-- prettier-ignore -->
```ruby
a, = [1, 2, 3]
```

would previously get printed as `a = [1, 2, 3]`, which changes the value of `a` from `1` to the value of the entire array.

- kddeisz - Experimental support for the HAMtemplate language.

### Changed

- github0013, kddeisz - Support proper string escaping when the original string in the source is wrapped in `%q|...|`. For example, `%q|\'|` should get printed as `"\'"`, where previously it was dropping the backslash.
- jamescostian, kddeisz - Force ternary breaking when using the lower-precendence operators `and` and `or`. For example,

<!-- prettier-ignore -->
```ruby
if x.nil?
  puts 'nil' and return
else
  x
end
```

the previous expression was being transformed into a ternary which was invalid ruby. Instead it now stays broken out into an if/else block.

- localhostdotdev], [@joeyjoejoejr], [@eins78, kddeisz - Better support for embedded expressions inside heredocs. For example,

<!-- prettier-ignore -->
```ruby
<<-HERE
  foo bar baz
  #{qux}
  foo bar baz
HERE
```

should remain formatted as it is. Whereas previously due to the way the lines were split, you would sometimes end up with it breaking after `#{`.

- jamescostian, kddeisz - Fix up `return` node printing. When returning multiple values, you need to return an array literal as opposed to using parentheses.

## [0.15.1] - 2019-11-05

### Changed

- AlanFoster - Add `bin/lex` for viewing the tokenized result of Ripper on Ruby code.
- jakeprime, kddeisz - When predicates from within an `if`, `unless`, `while`, or `until` loop break the line, they should be aligned together. For example,

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

- jamescostian], [@AlanFoster - Empty `if`, and `unless` conditionals are now handled gracefully:

<!-- prettier-ignore -->
```ruby
if foo?
end
```

- mmainz, kddeisz - Hash keys are not converted to keyword syntax if they would make invalid symbols. For example,

<!-- prettier-ignore -->
```ruby
{ :[] => nil }
```

cannot be translated into `[]:` as that is an invalid symbol. Instead, it stays with the hash rocket syntax.

- cldevs, kddeisz - Do not attempt to format the insides of xstring literals (string that get sent to the command line surrounded by backticks or `%x`).
- cldevs, kddeisz - When predicates for `if`, `unless`, `while`, or `until` nodes contain an assignment, we can't know for sure that it doesn't modify the body. In this case we need to always break and form a multi-line block.
- MarcManiez, kddeisz - When the return value of `if`, `unless`, `while`, or `until` nodes are assigned to anything other than a local variable, we need to wrap them in parentheses if we're changing to the modifier form. This is because the following expressions have different semantic meaning:

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

- AlanFoster - Fix crashes that were happening with `ignored_nl` nodes.

## [0.15.0] - 2019-08-06

### Changed

- dudeofawesome, kddeisz - If xstring literals (command line calls surrounded by backticks) break, then we indent and place the command on a new line. Previously, this was resulting in new lines getting added each time the code was formatted. Now this happens correctly.
- krachtstefan, kddeisz - When a `while` or `until` loop modifies a `begin...end` statement, it must remain in the modifier form or else it changes sematic meaning. For example,

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

- jviney], kddeisz - When transforming a block into the `Symbol#to_proc` syntax from within a list of arguments inside of an `aref` node (i.e., `foo[:bar.each`), we can't put the block syntax inside the brackets.
- jakeprime, kddeisz - Values for the `return` keyword that broke the line were previously just printed as they were, which breaks if you have a block expression like an `if` or `while`. For example,

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

- jakeprime, kddeisz - When switching from a double-quoted string to a single-quoted string that contained escaped double quotes, the backslashes would stay in the string. As in:

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

- kddeisz - Support for pattern matching for variables and array patterns. Currently waiting on Ripper support for hash patterns. For examples, check out the [test/js/patterns.test.js](test/js/patterns.test.js) file.

### Changed

- jviney, kddeisz - if/else blocks that had method calls on the end of them that were also transformed into ternaries need to have parens added to them. For example,

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

- acrewdson, kddeisz - Fixed a bug where multiple newlines at the end of the file would cause a crash.
- jviney, kddeisz - If a variable is assigned inside of the predicate of a conditional, then we can't change it into the single-line version as this breaks. For example,

<!-- prettier-ignore -->
```ruby
if foo = 1
  foo
end
```

must stay the same.

## [0.13.0] - 2019-07-05

### Added

- kddeisz - Added `locStart` and `locEnd` functions to support `--cursor-offset`.

### Changed

- xipgroc, kddeisz - Comments inside of `do...end` blocks that preceeded `call` nodes were associating the comment with the `var_ref` instead of the `call` itself. For example,

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

- petevk, kddeisz - Double splats inside a hash were previously failing to print. For example,

<!-- prettier-ignore -->
```ruby
{ foo: "bar", **baz }
```

would fail to print, but now works.

## [0.12.3] - 2019-05-16

### Changed

- kddeisz - Move arg, assign, constant, flow, massign, operator, scope, and statement nodes into their own files.
- kddeisz - Move `@int`, `access_ctrl`, `assocsplat`, `block_var`, `else`, `number_arg`, `super`, `undef`, `var_ref`, and `var_ref` as well as various call and symbol nodes into appropriate files.
- kddeisz - Better support for excessed commas in block args. Previously `proc { |x,| }` would add an extra space, but now it does not.
- kddeisz - Add a lot more documentation to the parser.
- glejeune, kddeisz - Previously, the unary `not` operator inside a ternary (e.g., `a ? not(b) : c`) would break because it wouldn't add parentheses, but now it adds them.
- kddeisz - `if` and `unless` nodes used to not be able to handle if a comment was the only statement in the body. For example,

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

- JoshuaKGoldberg, kddeisz - Fixes an error where `command` nodes within `def` nodes would fail to format if it was only a single block argument. For example,

<!-- prettier-ignore -->
```ruby
def curry(&block)
  new &block
end
```

would fail, but now works.

- xipgroc, kddeisz - Comments on lines with array references were previously deleting the array references entirely. For example,

<!-- prettier-ignore -->
```ruby
array[index] # comment
```

would previously result in `array[]`, but now prints properly.

## [0.12.2] - 2019-04-30

### Changed

- kddeisz - When symbol literal hash keys end with `=`, they cannot be transformed into hash labels.
- xipgroc, kddeisz - Fixed when blocks on methods with no arguments are transformed into `to_proc` syntax.

## [0.12.1] - 2019-04-22

### Changed

- kddeisz - If a lambda literal is nested under a `command` or `command_call` node anywhere in the heirarchy, then it needs to use the higher-precedence `{ ... }` braces as opposed to the `do ... end` delimiters.
- jpickwell, kddeisz - Calling `super` with a block and no args was causing the parser to fail when attempting to inspect lambda nodes.
- kddeisz - Support better breaking within interpolation by grouping the interpolated content.

## [0.12.0] - 2019-04-18

### Added

- kddeisz - Automatically convert `lambda { ... }` method calls into `-> { ... }` literals.

## [0.11.0] - 2019-04-18

### Added

- kddeisz - Support for parsing things with a ruby shebang (e.g., `#!/usr/bin/env ruby` or `#!/usr/bin/ruby`).
- kddeisz - Big tests refactor.
- kddeisz - Make multiple `when` predicates break at 80 chars and then wrap to be inline with the other predicates.
- kddeisz - Automatically add underscores in large numbers that aren't already formatted.
- AlanFoster - Better support for inline access control modifiers.
- jpickwell, kddeisz - Better support for heredocs in hash literals.
- kddeisz - Better support for heredocs in array literals.
- kddeisz - Support automatically transforming `def/begin/rescue/end/end` into `def/rescue/end`.

### Changed

- deecewan - Fixed support for dynamic string hash keys.
- kddeisz - Moved `case/when` into its own file and added better documentation.
- kddeisz - Moved `begin/rescue` into its own file.
- AlanFoster - Automatically add newlines around access modifiers.
- kddeisz - Alignment of command calls with arguments is fixed.
- aaronjensen, kddeisz - Alignment of `to` is explicitly allowed to not indent to better support rspec.
- kddeisz - Fix up the `to_proc` transform so that it works with other argument handling appropriately.
- kddeisz - Fixed regression on regexp comments.
- CodingItWrong, kddeisz - Fix up block delimiters when nested inside a `command` or `command_call` node.
- kddeisz - Moved hashes into its own file.

## [0.10.0] - 2019-03-25

### Added

- kddeisz - Support for block-local variables.
- kddeisz - Support for dyna-symbols that are using single quotes.

### Changed

- kddeisz - Force method calls after arrays, blocks, hashes, and xstrings to hang onto the end of the previous nodes.
- kddeisz - Check before anything else for an invalid ruby version.

## [0.9.1] - 2019-03-24

### Changed

- kddeisz - Better support string quotes by favoring what the user chose if the string contains escape patterns.
- kddeisz - Better support heredocs within method calls.

## [0.9.0] - 2019-03-18

### Added

- kddeisz - Support the `hasPragma` function.
- kddeisz - Support the new `number_arg` node type in Ruby 2.7.

### Changed

- kddeisz - Limit the number of nodes that are allowed to turn into ternary expressions.

## [0.8.0] - 2019-03-08

### Added

- kddeisz - Add `eslint` and fix up existing violations.
- AlanFoster - Add the infra for the `prettier` ruby gem.
- kddeisz - Add a `rake` task for easier process integration for the ruby gem.
- kddeisz - Handle direct interpolation of strings with %w array literals (i.e., `["#{foo}"]` should not be transformed into a %w array).

### Changed

- kddeisz - Fix string escaping for hex digit bit patterns when there's only one character after the "x".
- AlanFoster - Don't allow line breaks between brace block params.
- johnschoeman - Switch over the array.rb test case to minitest.
- AlanFoster - Test improvements to allow running in parallel.
- johnschoeman - Switch over assign.rb test case to minitest.
- AlanFoster - Add a contributing guide.
- AlanFoster - Handle longer command nodes.
- kddeisz - Changed the ruby executable within the `prettier` gem to `rbprettier` for easier autocomplete.

### Removed

- kddeisz - All instances of the spread (`...`) operator so that we can support older versions of node.

## [0.7.0] - 2019-02-24

### Changed

- kddeisz - Support checking for escaping within strings to force double quotes (e.g., "\n").
- RossKinsella, kddeisz - Handle cases with empty class and module declarations that need to break.
- AlanFoster - Align the `bin/print` and `bin/sexp` APto support `bin/print` taking a filepath.
- AndrewRayCode, kddeisz - Support lambdas that don't break and are inline.
- AlanFoster - Switch over the numbers.rb test to minitest.
- AlanFoster - Switch over the kwargs.rb test to minitest.
- AlanFoster - Bail out early if the Ruby input is invalid.
- kddeisz - Support `__END__` content.
- AlanFoster - Fix up issue with whitespace being added within regexp that are multiline.
- AlanFoster - Better support for destructuring within multi assignment.
- kddeisz - Switch `next` test over to minitest.
- kddeisz - Handle multiple arguments to `next` with a space between.
- AndrewRayCode, kddeisz - Handle multi-line conditional predicate (should align with keyword).
- aaronjensen, kddeisz - Properly support adding trailing commas with and without blocks.
- AlanFoster, kddeisz - Fix regression of handling comments within arrays on array literals.
- AlanFoster - Support multiple arguments to `undef`.

## [0.6.3] - 2019-02-18

### Changed

- kddeisz - Switch over `binary` fixture to minitest.
- kddeisz - Reconfigure parser into multiple layer modules so that it's easier to understand and manage.
- kddeisz - Handle comments from within `begin`, `rescue`, `ensure`, `while`, and `until` nodes.
- kddeisz - Properly indent heredocs without taking into account current indentation level.

## [0.6.2] - 2019-02-17

### Changed

- AlanFoster - Handle regexp suffixes.
- kddeisz - Add support for testing the test fixtures with minitest.
- kddeisz - Switch over `alias` and `regexp` tests to minitest.
- aaronjensen, kddeisz - Break up method args to split into multiple lines.
- christoomey, kddeisz - Handle blocks args when trailing commas are on.

## [0.6.1] - 2019-02-15

### Changed

- meleyal, kddeisz - Fix Ruby 2.5 inline comments on `args_add_block` nodes.
- meleyal, kddeisz - Support passing `super()` explicitly with no arguments.

## [0.6.0] - 2019-02-14

### Added

- kddeisz - Handle non UTF-8 comments.
- kddeisz - Handle non UTF-8 identifiers.
- kddeisz - Handle non UTF-8 strings.
- kddeisz - Handle empty parens.
- kddeisz - Handle rescue with splats preceeding the exception names.

### Changed

- kddeisz - Use `JSON::fast_generate` to get the s-expressions back from the parser.
- NoahTheDuke, kddeisz - Handle broken lambdas from within `command` and `command_call` nodes.

## [0.5.2] - 2019-02-13

### Changed

- kddeisz - Support embedded expressions within strings that contain only keywords, as in `"#{super}"`.

## [0.5.1] - 2019-02-13

### Changed

- yuki24, kddeisz - Force `do` blocks that we know have to be `do` blocks to break.
- kmcq, kddeisz - Handle `command` and `command_call` nodes `do` blocks by forcing them to break.
- ashfurrow, kddeisz - Attach comments to full hash association nodes, not just the value.

## [0.5.0] - 2019-02-13

### Added

- kddeisz - Automatically convert arrays of all string literals to %w arrays.
- kddeisz - Automatically convert arrays of all symbol literals to %i arrays.

### Changed

- kddeisz - Move the `args_add` and `args_new` handling into the parser.
- uri, kddeisz - Change `command_call` nodes to properly indent when broken and to not add a trailing comma.
- kddeisz - Rename the `trailingComma` option to `addTrailingCommas` to not conflict with the JS option.

## [0.4.1] - 2019-02-12

### Changed

- kddeisz - Provide the `makeList` utility for the nodes that are lists from within ripper.
- awinograd, kddeisz - Again, this time for real, properly escape strings.
- kddeisz - Fix up trailing commas on command calls.

## [0.4.0] - 2019-02-12

### Added

- Overload119, kddeisz - Support the `trailingComma` configuration option (defaults to `false`).

### Changed

- NoahTheDuke, kddeisz - Pass the code to be formatted over `stdin`.

## [0.3.7] - 2019-02-11

### Changed

- kddeisz - Split up statements even if they started on the same line with `;`s unless they are within an embedded expression.
- kddeisz - Properly handle escaped quotes within strings.

## [0.3.6] - 2019-02-10

### Changed

- AlanFoster, kddeisz - Support the `not` operator properly.
- AlanFoster, kddeisz - Handle comments properly inside `if`, `unless`, and `when` nodes.

## [0.3.5] - 2019-02-09

### Changed

- kddeisz - Handle lonely operators in Ruby `2.5`.

## [0.3.4] - 2019-02-09

### Changed

- kddeisz - Comments are now properly attached inside `defs` nodes.
- kddeisz - Support multiple inline comments on nodes.
- kddeisz - Support inline comments from within the `EXPR_END|EXPR_LABEL` lexer state.
- cbothner - Stop transforming multistatement blocks with `to_proc`.
- kddeisz - `do` blocks necessarily need to break their parent nodes.
- eins78, kddeisz - Handle `next` node edge case with `args_add` as the body.

## [0.3.3] - 2019-02-09

### Changed

- bugthing, kddeisz - Command nodes within conditionals now break parents to disallow them from being turned into ternary expressions.
- awinograd, kddeisz - Properly escape double quotes when using `preferSingleQuotes: false`.

## [0.3.2] - 2019-02-09

### Changed

- kddeisz - Don't define duplicated methods in the parser.
- kddeisz - Let prettier know about `.rb` and `.rake` files so you don't have to specify the parser when running.
- kddeisz - Renamed the package to @prettier/plugin-ruby.

## [0.3.1] - 2019-02-07

### Changed

- kddeisz - Automatically add parens to method declarations.
- kddeisz - Handle comments on bare hash assocs.
- kddeisz - Handle `method_add_block` nodes where the statements may be nested one more level.
- kddeisz - Handle heredocs nested no matter how many levels deep.

## [0.3.0] - 2019-02-07

### Added

- kddeisz - Support squiggly heredocs.
- kddeisz - Support straight heredocs.

### Changed

- kddeisz - Ignore current indentation when creating embdocs so that `=begin` is always at the beginning of the line.
- kddeisz - Move `regexp_add` and `regexp_new` handling into the parser.
- kddeisz - Move `xstring_add` and `xstring_new` handling into the parser.
- kddeisz - Move `string_add` and `string_content` handling into the parser.
- kddeisz - Move `mrhs_add` and `mrhs_new` handling into the parser.
- kddeisz - Move `mlhs_add` and `mlhs_new` handling into the parser.

## [0.2.1] - 2019-02-06

### Changed

- kddeisz - Handle brace blocks on commands properly.
- kddeisz - Break parent and return `do` blocks when called from a `command` node.
- kddeisz - Handle edge cases with `if` statements where there is no body of the if (so it can't be converted to a ternary).

## [0.2.0] - 2019-02-06

### Added

- kddeisz - Handle `methref` nodes from Ruby `2.7`.
- kddeisz - Allow `module` nodes to shorten using `;` when the block is empty.

### Changed

- kddeisz - Handle splat within an array, as in `[1, 2, *foo]`.
- kddeisz - Disallow comments from being attached to intermediary regex nodes.
- kddeisz - Fix `to_proc` transforms to reference the method called as opposed to the parameter name.
- kddeisz - Change statement lists to be generated within the parser instead of the printer, thereby allowing finer control over comments.
- kddeisz - Completely revamp comment parsing by switching off the internal lexer state from `ripper`. This should drastically increase accuracy of comment parsing in general, and set us up for success in the future.
- kddeisz - Allow comments to be attached to `CHAR` nodes.
- kddeisz - Disallow comments from being attached to `args_new` nodes.
- kddeisz - Track start and end lines so we can better insert block comments.
- kddeisz - Handle intermediary array nodes in the parse for better comment handling.

## [0.1.2] - 2019-02-05

### Changed

- kddeisz - Handle guard clauses that return with no parens.

## [0.1.1] - 2019-02-05

### Changed

- kddeisz - Handle class method calls with the `::` operator.
- kddeisz - Handle strings with apostrophes when using `preferSingleQuote`.
- kddeisz - Have travis run multiple ruby versions.
- kddeisz - Explicitly fail if ruby version is < `2.5`.
- kddeisz - Disallow comments from being attached to intermediary string nodes.

## [0.1.0] - 2019-02-04

### Added

- Initial release 🎉

[unreleased]: https://github.com/prettier/plugin-ruby/compare/v1.6.1...HEAD
[1.6.1]: https://github.com/prettier/plugin-ruby/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/prettier/plugin-ruby/compare/v1.5.5...v1.6.0
[1.5.5]: https://github.com/prettier/plugin-ruby/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/prettier/plugin-ruby/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/prettier/plugin-ruby/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/prettier/plugin-ruby/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/prettier/plugin-ruby/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/prettier/plugin-ruby/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/prettier/plugin-ruby/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/prettier/plugin-ruby/compare/v1.2.5...v1.3.0
[1.2.5]: https://github.com/prettier/plugin-ruby/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/prettier/plugin-ruby/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/prettier/plugin-ruby/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/prettier/plugin-ruby/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/prettier/plugin-ruby/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/prettier/plugin-ruby/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/prettier/plugin-ruby/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/prettier/plugin-ruby/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/prettier/plugin-ruby/compare/v1.0.0-rc2...v1.0.0
[1.0.0-rc2]: https://github.com/prettier/plugin-ruby/compare/v1.0.0-rc1...v1.0.0-rc2
[1.0.0-rc1]: https://github.com/prettier/plugin-ruby/compare/v0.22.0...v1.0.0-rc1
[0.22.0]: https://github.com/prettier/plugin-ruby/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/prettier/plugin-ruby/compare/v0.20.1...v0.21.0
[0.20.1]: https://github.com/prettier/plugin-ruby/compare/v0.20.0...v0.20.1
[0.20.0]: https://github.com/prettier/plugin-ruby/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/prettier/plugin-ruby/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/prettier/plugin-ruby/compare/v0.18.2...v0.19.0
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
