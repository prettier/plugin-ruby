const { concat, group, indent, line, softline } = require("../prettier");

function printBinary(path, opts, print) {
  const operator = path.getValue().body[1];
  const useNoSpace = operator === "**";

  return group(
    concat([
      group(path.call(print, "body", 0)),
      indent(
        concat([
          useNoSpace ? "" : " ",
          group(
            concat([
              operator,
              useNoSpace ? softline : line,
              path.call(print, "body", 2)
            ])
          )
        ])
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
  const oper = node.body[0];
  const contentsDoc = path.call(print, "body", 1);

  if (oper === "not") {
    const parts = ["not"];

    // Here we defer to the original source, as it's kind of difficult to
    // determine if we can actually remove the parentheses being used.
    if (node.paren) {
      parts.push("(", contentsDoc, ")");
    } else {
      parts.push(" ", contentsDoc);
    }

    return concat(parts);
  }

  return concat([oper[0], contentsDoc]);
}

module.exports = {
  binary: printBinary,
  dot2: printDot2,
  dot3: printDot3,
  unary: printUnary
};
