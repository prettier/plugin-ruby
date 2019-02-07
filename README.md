# prettier-ruby

[![Build Status](https://travis-ci.org/kddeisz/prettier-ruby.svg?branch=master)](https://travis-ci.org/kddeisz/prettier-ruby)
[![NPM Version](https://img.shields.io/npm/v/prettier-plugin-ruby.svg)](https://www.npmjs.com/package/prettier-plugin-ruby)

`prettier-ruby` is a [prettier](https://prettier.io/) plugin for the Ruby programming language. `prettier` is an opinionated code formatter that supports multiple languages and integrates with most editors. The idea is to eliminate discussions of style in code review and allow developers to get back to thinking about code design instead.

Under the hood `prettier-ruby` uses Ruby's own `ripper` library which allows this package to maintain parity with the existing Ruby parser. `prettier-ruby` supports Ruby versions `2.5`, `2.6`, and `trunk`.

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

when run through `prettier-ruby` will generate:

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

First, add `prettier-plugin-ruby` to your `package.json` `dependencies`, then install using either `npm install` or `yarn install`.

Verify by running against a file:

```
prettier --write --plugin=prettier-plugin-ruby --parser=ruby path/to/file.rb
```

If you're happy, you can can run `prettier` on an entire codebase:

```
prettier --write --plugin=prettier-plugin-ruby --parser=ruby **/*.rb
```

## Options

Below are the options (from [`src/ruby.js`](src/ruby.js)) that `prettier-ruby` currently supports:

* `inlineConditionals` - When it fits on one line, allow if and unless statements to use the modifier form.
* `inlineLoops` - When it fits on one line, allow while and until statements to use the modifier form.
* `preferHashLabels` - When possible, use the shortened hash key syntax, as opposed to hash rockets.
* `preferSingleQuotes` - When double quotes are not necessary for interpolation, prefer the use of single quotes for string literals.

## Development

After checking out the repo, run `yarn` and `bundle` to install dependencies. Then, run `yarn test` to run the tests. You can pretty print a Ruby source file by running `yarn print [PATH]`.

Useful resources for understanding the AST structure are:

* https://github.com/ruby/ruby/blob/trunk/parse.y - the Ruby parser that will give you the names of the nodes as well as their structure
* https://github.com/ruby/ruby/blob/trunk/test/ripper/test_parser_events.rb - the test file that gives you code examples of each kind of node

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/kddeisz/prettier-ruby.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
