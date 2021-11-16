import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { noIndent } from "../../utils";

const { group, indent, line, softline } = prettier;

export const printBinary: Plugin.Printer<Ruby.Binary> = (path, opts, print) => {
  const node = path.getValue();
  const space = node.op === "**" ? "" : " ";

  if (noIndent.includes(node.right.type)) {
    return group([
      group(path.call(print, "left")),
      space,
      node.op,
      space,
      group(path.call(print, "right"))
    ]);
  }

  return group([
    group(path.call(print, "left")),
    space,
    group(
      indent([
        node.op,
        space === "" ? softline : line,
        path.call(print, "right")
      ])
    )
  ]);
};

// dot2 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
export const printDot2: Plugin.Printer<Ruby.Dot2> = (path, opts, print) => {
  const node = path.getValue();

  return [
    node.left ? path.call(print, "left") : "",
    "..",
    node.right ? path.call(print, "right") : ""
  ];
};

// dot3 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
export const printDot3: Plugin.Printer<Ruby.Dot3> = (path, opts, print) => {
  const node = path.getValue();

  return [
    node.left ? path.call(print, "left") : "",
    "...",
    node.right ? path.call(print, "right") : ""
  ];
};

export const printUnary: Plugin.Printer<Ruby.Unary> = (path, opts, print) => {
  const node = path.getValue();

  return [node.op, path.call(print, "value")];
};

export const printNot: Plugin.Printer<Ruby.Not> = (path, opts, print) => {
  const node = path.getValue();
  const valueDoc = path.call(print, "value");

  if (node.paren) {
    return ["not", "(", valueDoc, ")"];
  }

  return ["not", " ", valueDoc];
};
