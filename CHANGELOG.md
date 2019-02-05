# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Handle splat within an array, as in `[1, 2, *foo]`.
- Disallow comments from being attached to intermediary regex nodes.

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
