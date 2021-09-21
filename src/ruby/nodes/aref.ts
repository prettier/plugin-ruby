import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, indent, join, line, softline } = prettier;

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
export const printAref: Plugin.Printer<Ruby.Aref> = (path, opts, print) => {
  const indexNode = path.getValue().body[1];

  if (!indexNode) {
    return [path.call(print, "body", 0), "[]"];
  }

  return printArefField(path, opts, print);
};

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
export const printArefField: Plugin.Printer<Ruby.Aref | Ruby.ArefField> = (
  path,
  opts,
  print
) => {
  const [printedArray, printedIndex] = path.map(print, "body");

  return group([
    printedArray,
    "[",
    indent([softline, join([",", line], printedIndex)]),
    softline,
    "]"
  ]);
};
