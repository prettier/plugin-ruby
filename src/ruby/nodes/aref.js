const {
  concat,
  group,
  indent,
  join,
  line,
  softline
} = require("../../prettier");

// `aref` nodes are when you're pulling a value out of a collection at a
// specific index. Put another way, it's any time you're calling the method
// `#[]`.
//
// The nodes usually contains two children, details below in the
// `printArefField` function. In some cases, you don't necessarily have the
// second child node, because you can call procs with a pretty esoteric syntax.
// In the following example, you wouldn't have a second child, and `"foo"` would
// be the first child.
//
//     foo[]
//
function printAref(path, opts, print) {
  const indexNode = path.getValue().body[1];

  if (!indexNode) {
    return concat([path.call(print, "body", 0), "[]"]);
  }

  return printArefField(path, opts, print);
}

// `aref_field` nodes are for assigning values into collections at specific
// indices. Put another way, it's any time you're calling the method `#[]=`.
// The `aref_field` node itself is just the left side of the assignment, and
// they're always wrapped in `assign` nodes.
//
// The nodes always contain two children, the name of the array (usually a
// `vcall` node and the index (usually an `args_add_block` node). The
// `args_add_block` is one of a couple nodes that has special handling where its
// printed form is actually an array to make joining easier.
//
// So in the following example, `"foo"` is the array and `["bar"]` is the index.
//
//     foo[bar] = baz
//
function printArefField(path, opts, print) {
  const [printedArray, printedIndex] = path.map(print, "body");

  return group(
    concat([
      printedArray,
      "[",
      indent(concat([softline, join(concat([",", line]), printedIndex)])),
      concat([softline, "]"])
    ])
  );
}

module.exports = {
  aref: printAref,
  aref_field: printArefField
};
