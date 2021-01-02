const { concat, group, indent, line, softline } = require("../../prettier");
const { noIndent } = require("../../utils");

function printBinary(path, opts, print) {
  const [_leftNode, operator, rightNode] = path.getValue().body;
  const space = operator === "**" ? "" : " ";

  if (noIndent.includes(rightNode.type)) {
    return group(
      concat([
        group(path.call(print, "body", 0)),
        space,
        operator,
        space,
        group(path.call(print, "body", 2))
      ])
    );
  }

  return group(
    concat([
      group(path.call(print, "body", 0)),
      space,
      group(
        indent(
          concat([
            operator,
            space === "" ? softline : line,
            path.call(print, "body", 2)
          ])
        )
      )
    ])
  );
}

// dot2 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
function printDot2(path, opts, print) {
  const [leftNode, rightNode] = path.getValue().body;

  return concat([
    leftNode ? path.call(print, "body", 0) : "",
    "..",
    rightNode ? path.call(print, "body", 1) : ""
  ]);
}

// dot3 nodes are used with ranges (or flip-flops). They can optionally drop
// their left side for beginless ranges or their right side for endless ranges.
function printDot3(path, opts, print) {
  const [leftNode, rightNode] = path.getValue().body;

  return concat([
    leftNode ? path.call(print, "body", 0) : "",
    "...",
    rightNode ? path.call(print, "body", 1) : ""
  ]);
}

function printUnary(path, opts, print) {
  const node = path.getValue();
  const contentsDoc = path.call(print, "body", 0);

  if (node.oper === "not") {
    // Here we defer to the original source, as it's kind of difficult to
    // determine if we can actually remove the parentheses being used.
    if (node.paren) {
      return concat(["not", "(", contentsDoc, ")"]);
    } else {
      return concat(["not", " ", contentsDoc]);
    }
  }

  return concat([node.oper, contentsDoc]);
}

module.exports = {
  binary: printBinary,
  dot2: printDot2,
  dot3: printDot3,
  unary: printUnary
};
