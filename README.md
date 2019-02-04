# prettier-ruby

[![Build Status](https://travis-ci.org/kddeisz/prettier-ruby.svg?branch=master)](https://travis-ci.org/kddeisz/prettier-ruby)

This is a [prettier](https://prettier.io/) plugin for the Ruby programming language. Under the hood it uses Ruby's own `ripper` library which allows this package to maintain parity with the existing Ruby parser.

## Getting started

You can pretty print a ruby source file by running `yarn print [PATH]`.

## Options

Below are the options (from [`src/ruby.js`](src/ruby.js)) that `prettier-ruby` currently supports:

* `inlineConditionals` - When it fits on one line, allow if and unless statements to use the modifier form.
* `inlineLoops` - When it fits on one line, allow while and until statements to use the modifier form.
* `preferHashLabels` - When possible, use the shortened hash key syntax, as opposed to hash rockets.
* `preferSingleQuotes` - When double quotes are not necessary for interpolation, prefer the use of single quotes for string literals.

## Development

After checking out the repo, run `yarn` and `bundle` to install dependencies. Then, run `yarn test` to run the tests.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/kddeisz/prettier-ruby.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
