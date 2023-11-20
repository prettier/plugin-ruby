<div align="center">
  <img alt="Prettier Ruby" height="256px" src="./docs/logo.png">
</div>

<h1 align="center">Prettier for Ruby</h1>

<p align="center">
  <a href="https://gitter.im/jlongster/prettier">
    <img alt="Gitter" src="https://img.shields.io/gitter/room/jlongster/prettier.svg?style=flat-square">
  </a>
  <a href="https://github.com/prettier/plugin-ruby/actions">
    <img alt="GitHub Actions" src="https://img.shields.io/github/actions/workflow/status/prettier/plugin-ruby/main.yml?branch=main&style=flat-square">
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
s.each_byte { |b| a << ("%036b" % d[b.chr.to_i]).scan(/\d{6}/) }
a.transpose.each do |a|
  a.join.each_byte { |i| print i == 49 ? ($*[1] || "#") : 32.chr }
  puts
end
```

## Getting started

The `@prettier/plugin-ruby` plugin for `prettier` is a small wrapper around the [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree) gem that provides a Ruby formatter for `prettier`. It does this by keeping a Ruby server running in that background that `prettier` can communicate with when it needs to format a Ruby file. This means that in order to function, you will need to have both the requisite `node` and `ruby` dependencies installed. Because of this configuration, there are a couple of ways that you can get setup to use this plugin.

- If you're already using `prettier` in your project to format other files in your project and want to install this as a plugin, you can install it using `npm`.
- If you're not using `prettier` yet in your project, then we recommend using the [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree) gem directly instead of using this plugin.
- Note that this plugin also ships a gem named `prettier` which is a wrapper around the `prettier` CLI and includes this plugin by default, but _we no longer recommend its use_. If you're using that gem, you should migrate to using [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree) instead.

To run `prettier` with the Ruby plugin as an `npm` package, you're going to need [`ruby`](https://www.ruby-lang.org/en/documentation/installation/) (version `2.7` or newer) and [`node`](https://nodejs.org/en/download/) (version `16` or newer).

If you're using the `npm` CLI, then add the plugin by:

```bash
npm install --save-dev prettier @prettier/plugin-ruby
```

Or if you're using `yarn`, then add the plugin by:

```bash
yarn add --dev prettier @prettier/plugin-ruby
```

You'll also need to add the necessary Ruby dependencies. You can do this by running:

```bash
gem install bundler prettier_print syntax_tree syntax_tree-haml syntax_tree-rbs
```

The `prettier` executable is now installed and ready for use:

```bash
./node_modules/.bin/prettier --plugin=@prettier/plugin-ruby --write '**/*'
```

### Using Prettier >= 3.0

You need to tell Prettier to use the plugin, add the following to your existing [prettier configuration
file](https://prettier.io/docs/en/configuration.html).

```json
{
  "plugins": ["@prettier/plugin-ruby"]
}
```

## Configuration

Below are the options (from [`src/plugin.js`](src/plugin.js)) that `@prettier/plugin-ruby` currently supports:

| API Option           | CLI Option            |                      Default                       | Description                                                                                                                                         |
| -------------------- | --------------------- | :------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `printWidth`         | `--print-width`       |                        `80`                        | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)).                                                    |
| `requirePragma`      | `--require-pragma`    |                      `false`                       | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#require-pragma)).                                                 |
| `rubyExecutablePath` | `"ruby"`              | Allows you to configure your Ruby executable path. |
| `rubyPlugins`        | `--ruby-plugins`      |                        `""`                        | The comma-separated list of plugins to require. See [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree#plugins).                         |
| `rubySingleQuote`    | `--ruby-single-quote` |                      `false`                       | Whether or not to default to single quotes for Ruby code. See [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree#plugins).               |
| `tabWidth`           | `--tab-width`         |                        `2`                         | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width)).                                                      |
| `trailingComma`      | `--trailing-comma`    |                       `es5`                        | Almost same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#trailing-commas)). Will be on for any value except `none`. |

Any of these can be added to your existing [prettier configuration
file](https://prettier.io/docs/en/configuration.html). For example:

```json
{
  "tabWidth": 4
}
```

Or, they can be passed to `prettier` as arguments:

```bash
bundle exec rbprettier --tab-width 4 --write '**/*'
```

### Ignoring code

Sometimes you want to leave your formatting in place and have `prettier` not format it, but continue to format the rest of the file. `prettier` has the ability to do this with `prettier-ignore` comments, but because the underlying formatter for this plugin is [Syntax Tree](https://github.com/ruby-syntax-tree/syntax_tree), you instead would use a `stree-ignore` comment.

### Usage with RuboCop

RuboCop and Prettier for Ruby serve different purposes, but there is overlap with some of RuboCop's functionality. Prettier provides a RuboCop configuration file to disable the rules which would clash. To enable this file, add the following configuration at the top of your project's `.rubocop.yml`:

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

Thanks so much for your interest in contributing! You can contribute in many ways, including:

- Contributing code to fix any bugs on [GitHub](https://github.com/prettier/plugin-ruby).
- Reporting issues on [GitHub](https://github.com/prettier/plugin-ruby/issues/new).
- Supporting `prettier/plugin-ruby` on [OpenCollective](https://opencollective.com/prettier-ruby/contribute). Your organization's logo will show up here with a link to your website.

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
