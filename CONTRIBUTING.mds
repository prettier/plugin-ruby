# Contributing

Thanks so much for your interest in contributing! This page provides background on how prettier and this plugin work, links for understanding each step that prettier executes, various helpful utilities for analyzing the tree structures being manipulated, and frequently asked questions.

Armed with the knowledge below, we would love to see your contribution! Please open an issue or a pull request at https://github.com/prettier/plugin-ruby.

- [How it works](#how-it-works)
  - [Text to AST](#text-to-ast)
  - [AST to Doc](#ast-to-doc)
  - [Doc to text](#doc-to-text)
- [FAQ](#faq)
- [Useful links](#useful-links)
  - [Ruby](#ruby)
  - [Ripper](#ripper)
  - [Prettier](#prettier)
- [Useful commands](#useful-commands)
- [Testing](#testing)

## How it works

In order to get printed, the code goes through a couple of transformations. The first is taking the entire file as text and parsing it into an abstract syntax tree (AST). The second is taking the AST and transforming it into prettier's intermediate representation, internally referred to as Docs. The final is taking the Doc nodes and converting them back into plain text, taking into account printing rules like max line length. Each of those steps is details below.

### Text to AST

When the prettier process first spins up, it examines which files it's going to print and selects an appropriate plugin for each one. Once selected, it runs that plugin's `parse` function, seen [here](src/parse.js). For the case of the Ruby plugin, that entails spawning a Ruby process that runs [ripper.rb](src/ripper.rb) with the input code preloaded on stdin.

`ripper.rb` will read the text off of stdin and then feed it to a new `Ripper` instance, which is a Ruby standard library recursive-descent parser. Briefly, the way that `Ripper` works is by tokenizing the input and then matching those tokens against a grammar to form s-expressions. To extend `Ripper`, you overwrite the methods that control how those s-expressions are formed, e.g., to modify the s-expression that is formed when `Ripper` encounters a string literal, you would override the `#on_string_literal` method. Below is an example for seeing that in action.

Let's assume you have the following code:

```ruby
1 + 1
```

First, `Ripper` will tokenize:

```ruby
require 'ripper'

pp Ripper.lex('1 + 1')

=begin
[[[1, 0], :on_int, "1", EXPR_END],
 [[1, 1], :on_sp, " ", EXPR_END],
 [[1, 2], :on_op, "+", EXPR_BEG],
 [[1, 3], :on_sp, " ", EXPR_BEG],
 [[1, 4], :on_int, "1", EXPR_END]]
=end
```

You can see it has location metadata (row and column), the token type, the value associated with that token type, and the lexer state when that token was encountered. Then, it will convert those tokens into s-expressions:

```ruby
require 'ripper'

pp Ripper.sexp_raw('1 + 1')

=begin
[:program,
 [:stmts_add,
  [:stmts_new],
  [:binary, [:@int, "1", [1, 0]], :+, [:@int, "1", [1, 4]]]]]
=end
```

As you can see above, the resulting s-expressions will call the following methods in order on the instantiated `Ripper` instance: `on_int`, `on_int`, `on_stmts_new`, `on_binary`, `on_stmts_add`, `on_program`. You can hook into any part of this process by overriding any of those methods (we override all of them).

Now that the text has been transformed into an AST that we can work with, `ripper.rb` will serialize the result to JSON, write it back to stdout, and exit. The `parse` function will then parse that JSON by reading off the child process once it has exited, and return that value back to prettier.

### AST to Doc

Once prettier has a working AST, it will take it and call the selected plugin's [`print` function](src/print.js), whose purpose is to convert that AST into prettier's intermediate representation called Docs. It does this by handing the print function a `FastPath` object that keeps track of the state of the printing as it goes, and allows accessing various parts of the AST quickly.

Effectively, it walks the AST in the reverse direction from the way `Ripper` built it (top-down instead of bottom-up). The first node that gets passed into the `print` function is the `program` node as that's always on top. Then it is the `program` node's responsibility to recursively call print on its child nodes as it best sees fit.

As the nodes are printing themselves and their children, they're additionally building up a second AST. That AST is built using the `builder` commands from prettier core, described [here](https://github.com/prettier/prettier/blob/master/commands.md). As an example, below is how a `binary` node (like the one representing the `1 + 1` above) would handle printing itself:

```javascript
const { concat, group, indent, line } = require("prettier").doc.builders;

const printBinary = (path, opts, print) =>
  group(
    concat([
      concat([path.call(print, "body", 0), " "]),
      path.getValue().body[1],
      indent(concat([line, path.call(print, "body", 2)]))
    ])
  );
```

Recall that the `binary` node looks like this:

```
[:binary, [:@int, "1", [1, 0]], :+, [:@int, "1", [1, 4]]]
```

This means that there is a node in the `0` position of the array that represents the left-hand operand, and a node in the `2` position of the array that represents the right-hand operand. The operator is represented as a string literal in the `1` position of the array.

So, the `printBinary` function is going to use the following `prettier` builders to build up the intermediate represention:

- `concat` - puts multiple nodes together and prints them without breaking them apart
- `group` - marks places where `prettier` could split text if the line gets too long; if the max line length is hit, `prettier` will break apart the outermost `group` node first
- `indent` - increases the current print indent for the contents of the node if the parent node is broken, e.g., if the `binary` node is too long to fit on one line, it will indent the right-hand operand
- `line` - puts a space if the group is not broken, otherwise puts a newline

Once every node has been printed like the `binary` node above, the `print` node returns the intermediate representation to `prettier`.

### Doc to text

At this point, this is where `prettier`'s printer takes over. Because the remainder of the process is language-agnostic and `prettier` knows how to handle its own `Doc` representation, the Ruby plugin no longer has a job to do. `prettier` will walk its own `Doc` nodes and print them out according to the rules established by the structure.

## FAQ

Below are a couple of questions frequently asked about the prettier Ruby plugin.

### Why Ripper over the other available Ruby parsers?

I've been asked this question a lot, and there are a lot of reasons for this:

1. Ripper is stdlib, and when the node process running prettier spawns the Ruby process performing the parsing, it's a lot easier to just require ripper than to worry about inconsistent environments having gems installed in myriad places.
2. Ripper is fast, which is nice as we need that to give the developer a good experience.
3. It was originally written in Ripper. Changing the parser at this point would entail an entire rewrite of the system, as the project is inextricably tied to the AST.

### Why are the Ruby options distinct from the JavaScript options?

In order to support all preferences, the Ruby options need to be distinct from the JavaScript options, otherwise you would not be able to, for example, have single quotes in Ruby and double quotes in JavaScript. They also indicate somewhat different things. In JavaScript, nothing changes when you use single versus double quotes, whereas in Ruby single and doubles quotes change interpolation behavior.

### What versions of Ruby are supported?

At the moment, we support back to Ruby 2.5. This is because in Ruby 2.5, Ripper got some additional public methods for accessing lexer state, which is necessary for parsing comments. This is not to say that prettier can't parse and print earlier versions of Ruby, it's just that the Ruby process running prettier (whatever `ruby` resolves to when the process runs) must be >= 2.5.

### Do you support ERB files (.html.erb, .js.erb, etc.)?

At the moment, prettier doesn't have baked-in support for template languages. The way it is accomplished in prettier core is to extend each of the individual parsers to have special placeholder AST nodes that then switch the printer over to the necessarily language. This is certainly possible to support ERB, but the work is still being investigated. See [this issue](https://github.com/prettier/plugin-ruby/issues/371) for more detail.

## Useful links

For further understanding, below is a list of helpful resources.

### Ruby

Links contained within the Ruby source that are relevant to this plugin.

- [parse.y](https://github.com/ruby/ruby/blob/trunk/parse.y) - the parser generator within Ruby that gives you the names of the nodes as well as their structure
- [test_parser_events.rb](https://github.com/ruby/ruby/blob/trunk/test/ripper/test_parser_events.rb) - the parser test file that gives you code examples of each kind of node

### Ripper

Links relating to `ripper` and how it parses Ruby source.

- [Ripper preview](https://ripper-preview.herokuapp.com) - a visualization of `ripper` and how it parses Ruby source
- [How ripper parses variables](https://rmosolgo.github.io/blog/2018/05/21/how-ripper-parses-variables/) - blog post neatly explaining how `ripper` parses variables
- [Ripper events](https://rmosolgo.github.io/ripper_events/) - documentation for each type of `ripper` node

### Prettier

Links relating to `prettier` and its plugins.

- [Prettier plugin documentation](https://prettier.io/docs/en/plugins.html) - documentation around `prettier`'s plugin system
- [Builder commands](https://github.com/prettier/prettier/blob/master/commands.md) - the functions used to build the `prettier` IR
- [Writing a Prettier plugin](https://medium.com/@fvictorio/how-to-write-a-plugin-for-prettier-a0d98c845e70) - a nice tutorial on how to build a `prettier` plugin

## Useful commands

While developing, we've built a couple of small utilities for debugging the `prettier` printing process. To use them, first run `yarn` and `bundle` to install dependencies.

- `bin/lex [file|source]` - outputs the tokens as ripper sees them
- `bin/sexp [file|source]` - outputs the AST that ripper builds before it gets passed back to `prettier`
- `bin/print [file|source]` - outputs the printed source of a Ruby file after running it through `prettier`
- `bin/has-pragma [file]` - runs the `hasPragma` function against the given input file

## Testing

There are two kinds of tests contained within this repository.

The first are JavaScript tests (run with `jest`) that test the formatting against preconfigured fixtures to protect against regressions. They live in [test/js](test/js). To run them, run:

```
$ yarn test
```

The second are Ruby tests (run with `minitest`) that test the gem the wraps the `prettier` plugin as well as testing the various metadata attached to the AST nodes that `ripper` generates. They live in [test/rb](test/rb). To run them, run:

```
$ bundle exec rake
```
