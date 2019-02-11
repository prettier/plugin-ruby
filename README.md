<div align="center">
  <img alt="Prettier" height="124px" src="https://cdn.rawgit.com/prettier/prettier-logo/master/images/prettier-icon-light.svg">
  <img alt="Ruby" height="124px" vspace="" hspace="25" src="https://www.ruby-lang.org/images/header-ruby-logo@2x.png">
</div>

<h2 align="center">Prettier for Ruby</h2>

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
]; a, s = [], $*[0]
s.each_byte { |b| a << ('%036b' % d[b.chr.to_i]).scan(/\d{6}/) }
a.transpose.each do |a|
  a.join.each_byte { |i| print i == 49 ? ($*[1] || '#') : 32.chr }
  puts
end
```

## Getting started

First, your system on which you're running is going to need a couple of things:

* [`ruby`](https://www.ruby-lang.org/en/documentation/installation/) `2.5` or newer - there are a lot of ways to install `ruby`, but I recommend [`rbenv`](https://github.com/rbenv/rbenv)
* [`node`](https://nodejs.org/en/download/) `8.3` or newer - `prettier` is a JavaScript package, so you're going to need to install `node` to work with it
* [`npm`](https://www.npmjs.com/get-npm) or [`yarn`](https://yarnpkg.com/en/docs/getting-started) - these are package managers for JavaScript, either one will do

Second, you're going to need to list `@prettier/plugin-ruby` as a JavaScript dependency from within whatever project on which you're working.

If you do not already have a `package.json` file in the root of your repository, you can create one with:

```
echo '{ "name": "My Project" }' > package.json
```

After that you can add `prettier` and `@prettier/plugin-ruby` to your `package.json` `devDependencies` by running `npm install prettier @prettier/plugin-ruby --saveDev` if you are using `npm` or `yarn add prettier @prettier/plugin-ruby --dev` if you are using `yarn`.

Finally, you can install your dependencies using either `npm install` for `npm` or `yarn install` for `yarn`.

Now, you can run `prettier` to tidy up your `ruby` files! Verify by running against a file:

```
./node_modules/.bin/prettier --write --plugin=@prettier/plugin-ruby path/to/file.rb
```

If you're happy, you can can run `prettier` on an entire codebase:

```
./node_modules/.bin/prettier --write --plugin=@prettier/plugin-ruby **/*.rb
```

Note that you can also install `prettier` globally with `npm install -g prettier` or you can add `./node_modules/.bin` to your `$PATH` so you don't need to reference the executable from the directory each time.

## Configuration

Below are the options (from [`src/ruby.js`](src/ruby.js)) that `@prettier/plugin-ruby` currently supports:

| Name | Default | Description |
|------|:-------:|-------------|
| `printWidth` | `80` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#print-width)). |
| `tabWidth` | `2` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width)). |
| `inlineConditionals` | `true` | When it fits on one line, allows if and unless statements to use the modifier form. |
| `inlineLoops` | `true` | When it fits on one line, allows while and until statements to use the modifier form. |
| `preferHashLabels` | `true` | When possible, uses the shortened hash key syntax, as opposed to hash rockets. |
| `preferSingleQuotes` | `true` | When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals. |

## Development

After checking out the repo, run `yarn` and `bundle` to install dependencies. Then, run `yarn test` to run the tests. You can pretty print a Ruby source file by running `yarn print [PATH]`.

Useful resources for understanding the AST structure are:

* https://github.com/ruby/ruby/blob/trunk/parse.y - the Ruby parser that will give you the names of the nodes as well as their structure
* https://github.com/ruby/ruby/blob/trunk/test/ripper/test_parser_events.rb - the test file that gives you code examples of each kind of node

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/prettier/plugin-ruby.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://github.com/kddeisz">
          <img width="150" height="150" src="https://github.com/kddeisz.png?v=3&s=150">
          </br>
          Kevin Deisz
        </a>
      </td>
    </tr>
  <tbody>
</table>
