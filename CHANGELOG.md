# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/CultureHQ/add-to-calendar/compare/0.3.1...HEAD
[0.3.1]: https://github.com/CultureHQ/add-to-calendar/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/CultureHQ/add-to-calendar/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/CultureHQ/add-to-calendar/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/CultureHQ/add-to-calendar/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/CultureHQ/add-to-calendar/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/CultureHQ/add-to-calendar/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/CultureHQ/add-to-calendar/compare/61f675...v0.1.0
