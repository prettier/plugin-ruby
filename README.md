<div align="center">
  <img alt="Prettier Ruby" height="256px" src="./docs/logo.png">
</div>

<h1 align="center">Prettier for Ruby</h1>

<p align="center">
  <a href="https://gitter.im/jlongster/prettier">
    <img alt="Gitter" src="https://img.shields.io/gitter/room/jlongster/prettier.svg?style=flat-square">
  </a>
  <a href="https://github.com/prettier/plugin-ruby/actions">
    <img alt="GitHub Actions" src="https://img.shields.io/github/workflow/status/prettier/plugin-ruby/Main?style=flat-square">
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

`@prettier/plugin-ruby` is a [prettier](https://prettier.io/) plugin for the Ruby programming language and its ecosystem. `prettier` is an opinionated code formatter that supports multiple languages and integrates with most editors. The idea is to eliminate discussions of style in code review and allow developers to get back to thinking about code design instead.

For example, the below [code segment](http://www.rubyinside.com/advent2006/4-ruby-obfuscation.html):

<!-- prettier-ignore -->
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
  30_644_250_780,
  9_003_106_878,
  30_636_278_846,
  66_641_217_692,
  4_501_790_980,
  671_24_603036,
  131_61973916,
  66_606629_920,
  30_642_677_916,
  30_643_069_058
]
a, s = [], $*[0]
s.each_byte { |b| a << ('%036b' % d[b.chr.to_i]).scan(/\d{6}/) }
a.transpose.each do |a|
  a.join.each_byte { |i| print i == 49 ? ($*[1] || '#') : 32.chr }
  puts
end
```

## Getting started

To run `prettier` with the Ruby plugin, you're going to need [`ruby`](https://www.ruby-lang.org/en/documentation/installation/) (version `2.5` or newer) and [`node`](https://nodejs.org/en/download/) (version `8.3` or newer). If you're integrating with a project that is not already using `prettier`, you should use the Ruby gem. Otherwise you can use the `npm` package directly.

Note that currently the editor integrations work best with the `npm` package, as most of the major editor plugins expect a `node_modules` directory. You can get them to work with the Ruby gem, but it requires manually configuring the paths.

This plugin currently supports formatting the following kinds of files:

- All varieties of Ruby source files (e.g., `*.rb`, `*.gemspec`, `Gemfile`, etc.)
- [RBS type language](https://github.com/ruby/rbs) files - requires having the `rbs` gem in your gem path
- [HAML template language](https://haml.info/) files - requires having the `haml` gem in your gem path

### Ruby gem

Add this line to your application's Gemfile:

```ruby
gem 'prettier'
```

And then execute:

```bash
bundle
```

Or install it yourself as:

```bash
gem install prettier
```

The `rbprettier` executable is now installed and ready for use:

```bash
bundle exec rbprettier --write '**/*'
```

### `npm` package

If you're using the `npm` CLI, then add the plugin by:

```bash
npm install --save-dev prettier @prettier/plugin-ruby
```

Or if you're using `yarn`, then add the plugin by:

```bash
yarn add --dev prettier @prettier/plugin-ruby
```

The `prettier` executable is now installed and ready for use:

```bash
./node_modules/.bin/prettier --write '**/*'
```

## Configuration

Below are the options (from [`src/plugin.js`](src/plugin.js)) that `@prettier/plugin-ruby` currently supports:

| API Option         | CLI Option             | Default  | Description                                                                                                                          |
| ------------------ | ---------------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------ |
| `printWidth`       | `--print-width`        |   `80`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)).                                     |
| `requirePragma`    | `--require-pragma`     | `false`  | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#require-pragma)).                                  |
| `rubyArrayLiteral` | `--ruby-array-literal` |  `true`  | When possible, favor the use of string and symbol array literals.                                                                    |
| `rubyHashLabel`    | `--ruby-hash-label`    |  `true`  | When possible, uses the shortened hash key syntax, as opposed to hash rockets.                                                       |
| `rubyModifier`     | `--ruby-modifier`      |  `true`  | When it fits on one line, allows while and until statements to use the modifier form.                                                |
| `rubySingleQuote`  | `--ruby-single-quote`  |  `true`  | When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals.                        |
| `rubyToProc`       | `--ruby-to-proc`       | `false`  | When possible, convert blocks to the more concise `Symbol#to_proc` syntax.                                                           |
| `tabWidth`         | `--tab-width`          |   `2`    | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width)).                                       |
| `trailingComma`    | `--trailing-comma`     | `"none"` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#trailing-comma)). `"es5"` is equivalent to `true`. |

Any of these can be added to your existing [prettier configuration
file](https://prettier.io/docs/en/configuration.html). For example:

```json
{
  "rubySingleQuote": false
}
```

Or, they can be passed to `prettier` as arguments:

```bash
bundle exec rbprettier --ruby-single-quote false --write '**/*'
```

### Usage with RuboCop

RuboCop and Prettier for Ruby serve different purposes, but there is overlap
with some of RuboCop's functionality.

Prettier provides a RuboCop configuration file to disable the rules which clash.
To enable, add the following config at the top of your project's `.rubocop.yml`:

#### Ruby gem

```yaml
inherit_gem:
  prettier: rubocop.yml
```

#### `npm` package

```yaml
inherit_from:
  - node_modules/@prettier/plugin-ruby/rubocop.yml
```

### Usage with an editor

For [supported editor integrations](https://github.com/prettier/prettier/blob/main/website/data/editors.yml), you should follow the instructions for installing the integration, then install the npm version of this plugin as a development dependency of your project. For most integrations, that should be sufficient. For convenience, the instructions for integrating with VSCode are used as an example below:

- Install the [Prettier - Code Formatter](https://github.com/prettier/prettier-vscode) extension.
- Add the npm `@prettier/plugin-ruby` package to your project as described above.
- Configure in your `settings.json` (`formatOnSave` is optional):

```json
{
  "[ruby]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

Refer to [this issue](https://github.com/prettier/plugin-ruby/issues/113#issuecomment-783426539) if you're having difficulties.

## Contributing

Check out our [contributing guide](CONTRIBUTING.md). Bug reports and pull requests are welcome on GitHub at https://github.com/prettier/plugin-ruby.

You can support `prettier/plugin-ruby` [on OpenCollective](https://opencollective.com/prettier-ruby/contribute). Your organization's logo will show up here with a link to your website.

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<a href="https://opencollective.com/prettier-ruby/organization/0/website"><img src="https://opencollective.com/prettier-ruby/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/1/website"><img src="https://opencollective.com/prettier-ruby/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/2/website"><img src="https://opencollective.com/prettier-ruby/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/3/website"><img src="https://opencollective.com/prettier-ruby/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/4/website"><img src="https://opencollective.com/prettier-ruby/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/5/website"><img src="https://opencollective.com/prettier-ruby/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/6/website"><img src="https://opencollective.com/prettier-ruby/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/7/website"><img src="https://opencollective.com/prettier-ruby/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/8/website"><img src="https://opencollective.com/prettier-ruby/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/prettier-ruby/organization/9/website"><img src="https://opencollective.com/prettier-ruby/organization/9/avatar.svg"></a>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
