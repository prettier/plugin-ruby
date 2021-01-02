const { concat, join } = require("../../prettier");
const { literal } = require("../../utils");

const nodeDive = (node, steps) => {
  let current = node;

  steps.forEach((step) => {
    current = current[step];
  });

  return current;
};

const unskippableParens = [
  "if_mod",
  "rescue_mod",
  "unless_mod",
  "until_mod",
  "while_mod"
];

const maybeHandleParens = (path, print, keyword, steps) => {
  const node = nodeDive(path.getValue(), steps);
  if (node.type !== "paren") {
    return null;
  }

  const stmts = node.body[0].body;
  if (stmts.length === 1 && !unskippableParens.includes(stmts[0].type)) {
    return concat([
      `${keyword} `,
      path.call.apply(path, [print].concat(steps).concat("body", 0))
    ]);
  }

  return concat([keyword, path.call.apply(path, [print].concat(steps))]);
};

module.exports = {
  break: (path, opts, print) => {
    const content = path.getValue().body[0];

    if (content.body.length === 0) {
      return "break";
    }

    const steps = ["body", 0, "body", 0, "body", 0];
    return (
      maybeHandleParens(path, print, "break", steps) ||
      concat(["break ", join(", ", path.call(print, "body", 0))])
    );
  },
  next: (path, opts, print) => {
    const args = path.getValue().body[0].body[0];

    if (!args) {
      return "next";
    }

    const steps = ["body", 0, "body", 0, "body", 0];
    return (
      maybeHandleParens(path, print, "next", steps) ||
      concat(["next ", join(", ", path.call(print, "body", 0))])
    );
  },
  yield: (path, opts, print) => {
    if (path.getValue().body[0].type === "paren") {
      return concat(["yield", path.call(print, "body", 0)]);
    }

    return concat(["yield ", join(", ", path.call(print, "body", 0))]);
  },
  yield0: literal("yield")
};
