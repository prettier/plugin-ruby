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

`@prettier/plugin-ruby` is a [prettier](https://prettier.io/) plugin for the Ruby programming language (versions `2.5` and above). `prettier` is an opinionated code formatter that supports multiple languages and integrates with most editors. The idea is to eliminate discussions of style in code review and allow developers to get back to thinking about code design instead.

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

To run `prettier` with the Ruby plugin, you're going to need [`ruby`](https://www.ruby-lang.org/en/documentation/installation/) (version `2.5` or newer) and [`node`](https://nodejs.org/en/download/) (version `8.3` or newer). If you're integrating with a project that is not already using `prettier`, you should use the ruby gem. Otherwise you can use the `npm` package directly.

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
bundle exec rbprettier --write '**/*.rb'
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
./node_modules/.bin/prettier --write '**/*.rb'
```

## Configuration

Below are the options (from [`src/ruby.js`](src/ruby.js)) that `@prettier/plugin-ruby` currently supports:

| Name                 | Default | Description                                                                                                   |
| -------------------- | :-----: | ------------------------------------------------------------------------------------------------------------- |
| `printWidth`         |  `80`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)).              |
| `requirePragma`      | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#require-pragma)).           |
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
prettier --prefer-single-quotes false --write '**/*.rb'
```

## Contributing

Check out our [contributing guide](CONTRIBUTING.md). Bug reports and pull requests are welcome on GitHub at https://github.com/prettier/plugin-ruby.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kevindeisz.com"><img src="https://avatars2.githubusercontent.com/u/5093358?v=4" width="100px;" alt="Kevin Deisz"/><br /><sub><b>Kevin Deisz</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=kddeisz" title="Code">💻</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=kddeisz" title="Documentation">📖</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=kddeisz" title="Tests">⚠️</a> <a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Akddeisz" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.alanfoster.me/"><img src="https://avatars2.githubusercontent.com/u/1271782?v=4" width="100px;" alt="Alan Foster"/><br /><sub><b>Alan Foster</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=AlanFoster" title="Code">💻</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=AlanFoster" title="Documentation">📖</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=AlanFoster" title="Tests">⚠️</a> <a href="https://github.com/prettier/plugin-ruby/issues?q=author%3AAlanFoster" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/johnschoeman"><img src="https://avatars0.githubusercontent.com/u/16049495?v=4" width="100px;" alt="johnschoeman"/><br /><sub><b>johnschoeman</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=johnschoeman" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/aaronjensen"><img src="https://avatars3.githubusercontent.com/u/8588?v=4" width="100px;" alt="Aaron Jensen"/><br /><sub><b>Aaron Jensen</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=aaronjensen" title="Documentation">📖</a></td>
    <td align="center"><a href="http://cameronbothner.com"><img src="https://avatars1.githubusercontent.com/u/4642599?v=4" width="100px;" alt="Cameron Bothner"/><br /><sub><b>Cameron Bothner</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=cbothner" title="Code">💻</a></td>
    <td align="center"><a href="https://localhost.dev"><img src="https://avatars3.githubusercontent.com/u/47308085?v=4" width="100px;" alt="localhost.dev"/><br /><sub><b>localhost.dev</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Alocalhostdotdev" title="Bug reports">🐛</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=localhostdotdev" title="Code">💻</a></td>
    <td align="center"><a href="https://deecewan.github.io"><img src="https://avatars0.githubusercontent.com/u/4755785?v=4" width="100px;" alt="David Buchan-Swanson"/><br /><sub><b>David Buchan-Swanson</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Adeecewan" title="Bug reports">🐛</a> <a href="https://github.com/prettier/plugin-ruby/commits?author=deecewan" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/jpickwell"><img src="https://avatars1.githubusercontent.com/u/4682321?v=4" width="100px;" alt="Jordan Pickwell"/><br /><sub><b>Jordan Pickwell</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Ajpickwell" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://codingitwrong.com"><img src="https://avatars0.githubusercontent.com/u/15832198?v=4" width="100px;" alt="Josh Justice"/><br /><sub><b>Josh Justice</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3ACodingItWrong" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/xipgroc"><img src="https://avatars0.githubusercontent.com/u/28561131?v=4" width="100px;" alt="xipgroc"/><br /><sub><b>xipgroc</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Axipgroc" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://lejeun.es"><img src="https://avatars1.githubusercontent.com/u/15168?v=4" width="100px;" alt="Gregoire Lejeune"/><br /><sub><b>Gregoire Lejeune</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Aglejeune" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/petevk"><img src="https://avatars3.githubusercontent.com/u/5108627?v=4" width="100px;" alt="Pete Van Klaveren"/><br /><sub><b>Pete Van Klaveren</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Apetevk" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/meleyal"><img src="https://avatars3.githubusercontent.com/u/15045?v=4" width="100px;" alt="meleyal"/><br /><sub><b>meleyal</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=meleyal" title="Documentation">📖</a></td>
    <td align="center"><a href="https://lip.is"><img src="https://avatars1.githubusercontent.com/u/125676?v=4" width="100px;" alt="Lipis"/><br /><sub><b>Lipis</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=lipis" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://janpiotrowski.de"><img src="https://avatars0.githubusercontent.com/u/183673?v=4" width="100px;" alt="Jan Piotrowski"/><br /><sub><b>Jan Piotrowski</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=janpio" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.andywaite.com"><img src="https://avatars1.githubusercontent.com/u/13400?v=4" width="100px;" alt="Andy Waite"/><br /><sub><b>Andy Waite</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/commits?author=andyw8" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jviney"><img src="https://avatars3.githubusercontent.com/u/7051?v=4" width="100px;" alt="Jonathan Viney"/><br /><sub><b>Jonathan Viney</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Ajviney" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/acrewdson"><img src="https://avatars0.githubusercontent.com/u/10353074?v=4" width="100px;" alt="acrewdson"/><br /><sub><b>acrewdson</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Aacrewdson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://orleans.io"><img src="https://avatars0.githubusercontent.com/u/1683595?v=4" width="100px;" alt="Louis Orleans"/><br /><sub><b>Louis Orleans</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Adudeofawesome" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/cvoege"><img src="https://avatars2.githubusercontent.com/u/6777709?v=4" width="100px;" alt="Colton Voege"/><br /><sub><b>Colton Voege</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Acvoege" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://stefankracht.de"><img src="https://avatars1.githubusercontent.com/u/529711?v=4" width="100px;" alt="Stefan Kracht"/><br /><sub><b>Stefan Kracht</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Akrachtstefan" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/jakeprime"><img src="https://avatars1.githubusercontent.com/u/1019036?v=4" width="100px;" alt="jakeprime"/><br /><sub><b>jakeprime</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Ajakeprime" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://mmainz.github.io"><img src="https://avatars2.githubusercontent.com/u/5417714?v=4" width="100px;" alt="Mario Mainz"/><br /><sub><b>Mario Mainz</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Ammainz" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.cldevs.com"><img src="https://avatars3.githubusercontent.com/u/38632061?v=4" width="100px;" alt="CL Web Developers"/><br /><sub><b>CL Web Developers</b></sub></a><br /><a href="https://github.com/prettier/plugin-ruby/issues?q=author%3Acldevs" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
