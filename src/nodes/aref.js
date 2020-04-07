const { concat, group, indent, join, line, softline } = require("../prettier");

/* `aref` nodes are when you're pulling a value out of a collection at a
 * specific index. Put another way, it's any time you're calling the method
 * `#[]`.
 *
 * The nodes can contain two children, the array and the index. So in the
 * following example, `foo` is the array and `bar is the index.
 *
 *     foo[bar]
 *
 * In some cases, you don't necessarily have the second child node, because you
 * can call procs with a pretty esoteric syntax:
 *
 *     foo[]
 */
const printAref = (path, opts, print) => {
  const indexNode = path.getValue().body[1];

  if (!indexNode) {
    return concat([path.call(print, "body", 0), "[]"]);
  }

  return printArefField(path, opts, print);
};

/* `aref_field` nodes are for assigning values into collections are specific
 * indices. Put another way, it's any time you're calling the method `#[]=`.
 * The `aref_field` node itself is just the left side of the assignment, and
 * they're always wrapped in `assign` nodes.
 *
 * The nodes always contain two children, the array and the index. So in the
 * following example, `foo` is the array and `bar` is the index.
 *
 *     foo[bar] = baz
 */
const printArefField = (path, opts, print) => {
  const [printedArray, printedIndex] = path.map(print, "body");

  return group(
    concat([
      printedArray,
      "[",
      indent(concat([softline, join(concat([",", line]), printedIndex)])),
      concat([softline, "]"])
    ])
  );
};

module.exports = {
  aref: printAref,
  aref_field: printArefField
};
