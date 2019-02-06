# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
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

[Unreleased]: https://github.com/CultureHQ/add-to-calendar/compare/0.1.2...HEAD
[0.1.2]: https://github.com/CultureHQ/add-to-calendar/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/CultureHQ/add-to-calendar/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/CultureHQ/add-to-calendar/compare/61f675...v0.1.0
