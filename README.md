<div align="center">
  <img alt="Prettier Ruby" height="256px" src="./docs/logo.png">
</div>

<h1 align="center">Prettier for Ruby</h1>

<p align="center">
  <a href="https://gitter.im/jlongster/prettier">
    <img alt="Gitter" src="https://img.shields.io/gitter/room/jlongster/prettier.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/prettier/plugin-ruby">
    <img alt="Travis" src="https://img.shields.io/travis/prettier/plugin-ruby/master.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/@prettier/plugin-ruby">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@prettier/plugin-ruby.svg?style=flat-square">
  </a>
  <a href="#badge">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
  </a>
  <a href="https://twitter.com/PrettierCode">
    <img alt="Follow+Prettier+on+Twitter" src="https://img.shields.io/twitter/follow/prettiercode.svg?label=follow+prettier&style=flat-square">
  </a>
</p>

`@prettier/plugin-ruby` is a [prettier](https://prettier.io/) plugin for the Ruby programming language. `prettier` is an opinionated code formatter that supports multiple languages and integrates with most editors. The idea is to eliminate discussions of style in code review and allow developers to get back to thinking about code design instead.

Under the hood `@prettier/plugin-ruby` uses Ruby's own `ripper` library which allows this package to maintain parity with the existing Ruby parser. `@prettier/plugin-ruby` supports Ruby versions `2.5`, `2.6`, and `trunk`.

For example, the below [code segment](http://www.rubyinside.com/advent2006/4-ruby-obfuscation.html):

```ruby
        d=[30644250780,9003106878,
    30636278846,66641217692,4501790980,
 671_24_603036,131_61973916,66_606629_920,
   30642677916,30643069058];a,s=[],$*[0]
      s.each_byte{|b|a<<("%036b"%d[b.
         chr.to_i]).scan(/\d{6}/)}
          a.transpose.each{ |a|
            a.join.each_byte{\
             |i|print i==49?\
               ($*[1]||"#")\
                 :32.chr}
                   puts
                    }
```

when run through `@prettier/plugin-ruby` will generate:

```ruby
d = [
  30644250780,
  9003106878,
  30636278846,
  66641217692,
  4501790980,
  671_24_603036,
  131_61973916,
  66_606629_920,
  30642677916,
  30643069058
]
a, s = [], $*[0]
s.each_byte { |b| a << ('%036b' % d[b.chr.to_i]).scan(/\d{6}/) }
a.transpose.each do |a|
  a.join.each_byte { |i| print i == 49 ? ($*[1] || '#') : 32.chr }
  puts
end
```

## Getting started

First, your system on which you're running is going to need a couple of things:

- [`ruby`](https://www.ruby-lang.org/en/documentation/installation/) `2.5` or newer - there are a lot of ways to install `ruby`, but I recommend [`rbenv`](https://github.com/rbenv/rbenv)
- [`node`](https://nodejs.org/en/download/) `8.3` or newer - `prettier` is a JavaScript package, so you're going to need to install `node` to work with it
- [`npm`](https://www.npmjs.com/get-npm) or [`yarn`](https://yarnpkg.com/en/docs/getting-started) - these are package managers for JavaScript, either one will do

Second, you're going to need to list `@prettier/plugin-ruby` as a JavaScript dependency from within whatever project on which you're working.

If you do not already have a `package.json` file in the root of your repository, you can create one with:

```bash
echo '{ "name": "My Project" }' > package.json
```

After that you can add `prettier` and `@prettier/plugin-ruby` to your `package.json` `devDependencies` by running `npm install --save-dev prettier @prettier/plugin-ruby` if you are using `npm` or `yarn add --dev prettier @prettier/plugin-ruby` if you are using `yarn`.

Finally, you can install your dependencies using either `npm install` for `npm` or `yarn install` for `yarn`.

Now, you can run `prettier` to tidy up your `ruby` files! Verify by running against a file:

```bash
./node_modules/.bin/prettier --write path/to/file.rb
```

If you're happy, you can can run `prettier` on an entire codebase:

```bash
./node_modules/.bin/prettier --write '**/*.{rb,rake}'
```

Note that you can also install `prettier` globally with `npm install -g prettier` or you can add `./node_modules/.bin` to your `$PATH` so you don't need to reference the executable from the directory each time.

## Configuration

Below are the options (from [`src/ruby.js`](src/ruby.js)) that `@prettier/plugin-ruby` currently supports:

| Name                 | Default | Description                                                                                                   |
| -------------------- | :-----: | ------------------------------------------------------------------------------------------------------------- |
| `printWidth`         |  `80`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)).              |
| `tabWidth`           |   `2`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width)).                |
| `addTrailingCommas`  | `false` | Adds a trailing comma to array literals, hash literals, and method calls.                                     |
| `inlineConditionals` | `true`  | When it fits on one line, allows if and unless statements to use the modifier form.                           |
| `inlineLoops`        | `true`  | When it fits on one line, allows while and until statements to use the modifier form.                         |
| `preferHashLabels`   | `true`  | When possible, uses the shortened hash key syntax, as opposed to hash rockets.                                |
| `preferSingleQuotes` | `true`  | When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals. |

Any of these can be added to your existing [prettier configuration
file](https://prettier.io/docs/en/configuration.html). For example:

```json
{
  "preferSingleQuotes": false
}
```

Or, they can be passed to `prettier` as arguments:

```bash
./node_modules/.bin/prettier --prefer-single-quotes false --write '**/*.{rb,rake}'
```

## Contributing

Check out our [contributing guide](CONTRIBUTING.md). Bug reports and pull requests are welcome on GitHub at https://github.com/prettier/plugin-ruby.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://kevindeisz.com"><img src="https://avatars2.githubusercontent.com/u/5093358?v=4" width="100px;" alt="Kevin Deisz"/><br /><sub><b>Kevin Deisz</b></sub></a><br /><a href="https://github.com/kddeisz/plugin-ruby/commits?author=kddeisz" title="Code">💻</a> <a href="https://github.com/kddeisz/plugin-ruby/commits?author=kddeisz" title="Documentation">📖</a> <a href="#maintenance-kddeisz" title="Maintenance">🚧</a> <a href="#review-kddeisz" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/kddeisz/plugin-ruby/commits?author=kddeisz" title="Tests">⚠️</a></td><td align="center"><a href="https://www.alanfoster.me/"><img src="https://avatars2.githubusercontent.com/u/1271782?v=4" width="100px;" alt="Alan Foster"/><br /><sub><b>Alan Foster</b></sub></a><br /><a href="https://github.com/kddeisz/plugin-ruby/commits?author=AlanFoster" title="Code">💻</a> <a href="https://github.com/kddeisz/plugin-ruby/commits?author=AlanFoster" title="Documentation">📖</a> <a href="#review-AlanFoster" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/kddeisz/plugin-ruby/commits?author=AlanFoster" title="Tests">⚠️</a></td><td align="center"><a href="https://github.com/johnschoeman"><img src="https://avatars0.githubusercontent.com/u/16049495?v=4" width="100px;" alt="johnschoeman"/><br /><sub><b>johnschoeman</b></sub></a><br /><a href="https://github.com/kddeisz/plugin-ruby/commits?author=johnschoeman" title="Tests">⚠️</a></td><td align="center"><a href="https://twitter.com/aaronjensen"><img src="https://avatars3.githubusercontent.com/u/8588?v=4" width="100px;" alt="Aaron Jensen"/><br /><sub><b>Aaron Jensen</b></sub></a><br /><a href="https://github.com/kddeisz/plugin-ruby/commits?author=aaronjensen" title="Documentation">📖</a></td><td align="center"><a href="http://cameronbothner.com"><img src="https://avatars1.githubusercontent.com/u/4642599?v=4" width="100px;" alt="Cameron Bothner"/><br /><sub><b>Cameron Bothner</b></sub></a><br /><a href="https://github.com/kddeisz/plugin-ruby/commits?author=cbothner" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!