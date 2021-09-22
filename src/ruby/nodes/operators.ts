import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { noIndent } from "../../utils";

const { group, indent, line, softline } = prettier;

export const printBinary: Plugin.Printer<Ruby.Binary> = (path, opts, print) => {
  const [, operator, rightNode] = path.getValue().body;
  const space = operator === "**" ? "" : " ";

  if (noIndent.includes(rightNode.type)) {
    return group([
      group(path.call(print, "body", 0)),
      space,
      operator,
      space,
      group(path.call(print, "body", 2))
    ]);
  }

  return group([
    group(path.call(print, "body", 0)),
    space,
    group(
      indent([
        operator,
        space === "" ? softline : line,
        path.call(print, "body", 2)
      ])
    )
  ]);
};

// dot2 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
export const printDot2: Plugin.Printer<Ruby.Dot2> = (path, opts, print) => {
  const [leftNode, rightNode] = path.getValue().body;

  return [
    leftNode ? path.call(print, "body", 0) : "",
    "..",
    rightNode ? path.call(print, "body", 1) : ""
  ];
};

// dot3 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
export const printDot3: Plugin.Printer<Ruby.Dot3> = (path, opts, print) => {
  const [leftNode, rightNode] = path.getValue().body;

  return [
    leftNode ? path.call(print, "body", 0) : "",
    "...",
    rightNode ? path.call(print, "body", 1) : ""
  ];
};

export const printUnary: Plugin.Printer<Ruby.Unary> = (path, opts, print) => {
  const node = path.getValue();
  const contentsDoc = path.call(print, "body", 0);

  if (node.oper === "not") {
    // Here we defer to the original source, as it's kind of difficult to
    // determine if we can actually remove the parentheses being used.
    if (node.paren) {
      return ["not", "(", contentsDoc, ")"];
    } else {
      return ["not", " ", contentsDoc];
    }
  }

  return [node.oper, contentsDoc];
};
