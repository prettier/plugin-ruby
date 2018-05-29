# prettier-ruby

This is a work in progress plugin for prettier that supports the Ruby programming language. Under the hood it uses the [`ripperjs`](https://github.com/kddeisz/ripperjs) package (which in turn uses Ruby's own `ripper` library) which allows this package to maintain parity with the existing Ruby parser.

## Getting started

Install the dependencies by running `yarn` in the root of the repository. You can then pretty print a ruby source file by running `yarn print [PATH]`.

## Options

Below are the options (from [`src/index.js`](src/index.js)) that `prettier-ruby` currently supports:

* `inlineConditionals` - When it fits on one line, allow if and unless statements to use the modifier form.
* `inlineLoops` - When it fits on one line, allow while and until statements to use the modifier form.
* `preferHashLabels` - When possible, use the shortened hash key syntax, as opposed to hash rockets.
* `preferSingleQuotes` - When double quotes are not necessary for interpolation, prefer the use of single quotes for string literals.

## Known limitations

Currently, `prettier-ruby` drops a lot of comments.
