const {
  addTrailingComment,
  align,
  concat,
  group,
  hardline,
  line
} = require("../../prettier");

// In general, return the printed doc of the argument at the provided index.
// Special handling is given for symbol literals that are not bare words, as we
// convert those into bare words by just pulling out the ident node.
function printAliasArgument(path, print, argIndex) {
  const node = path.getValue().body[argIndex];

  if (node.type === "symbol_literal") {
    // If we're going to descend into the symbol literal to grab out the ident
    // node, then we need to make sure we copy over any comments as well,
    // otherwise we could accidentally skip printing them.
    if (node.comments) {
      node.comments.forEach((comment) => {
        addTrailingComment(node.body[0], comment);
      });
    }

    return path.call(print, "body", argIndex, "body", 0);
  }

  return path.call(print, "body", argIndex);
}

// The `alias` keyword is used to make a method respond to another name as well
// as the current one. For example, to get the method `foo` to also respond to
// `bar`, you would:
//
//     alias bar foo
//
// Now, in the current context you can call `bar` and it will execute the `foo`
// method.
//
// When you're aliasing two methods, you can either provide bare words (like the
// example above) or you can provide symbols (note that this includes dynamic
// symbols like :"foo-#{bar}-baz"). In general, to be consistent with the ruby
// style guide, we prefer bare words:
//
//     https://github.com/rubocop-hq/ruby-style-guide#alias-method-lexically
//
// The `alias` node contains two children. The left and right align with the
// arguments passed to the keyword. So, for the above example the left would be
// the symbol literal `bar` and the right could be the symbol literal `foo`.
function printAlias(path, opts, print) {
  const keyword = "alias ";

  const rightSide = concat([
    // If the left child has any comments, then we need to explicitly break this
    // into two lines
    path.getValue().body[0].comments ? hardline : line,
    printAliasArgument(path, print, 1)
  ]);

  return group(
    concat([
      keyword,
      printAliasArgument(path, print, 0),
      group(align(keyword.length, rightSide))
    ])
  );
}

module.exports = {
  alias: printAlias,
  var_alias: printAlias
};
