const {
  concat,
  group,
  ifBreak,
  indent,
  line,
  join,
  softline
} = require("../prettier");
const { literal } = require("../utils");

// You can't skip the parentheses if you have the `and` or `or` operator,
// because they have low enough operator precedence that you need to explicitly
// keep them in there.
const canSkipParens = (args) => {
  const statement = args.body[0].body[0].body[0];
  return (
    statement.type !== "binary" || !["and", "or"].includes(statement.body[1])
  );
};

const printReturn = (path, opts, print) => {
  let args = path.getValue().body[0].body[0];
  let steps = ["body", 0, "body", 0];

  if (!args) {
    return "return";
  }

  // If the body of the return contains parens, then just skip directly to the
  // content of the parens so that we can skip printing parens if we don't
  // want them.
  if (args.body[0] && args.body[0].type === "paren" && canSkipParens(args)) {
    args = args.body[0].body[0];
    steps = steps.concat("body", 0, "body", 0);
  }

  // If we're returning an array literal that isn't a special array, single
  // element array, or an empty array, then we want to grab the arguments so
  // that we can print them out as if they were normal return arguments.
  if (
    args.body[0] &&
    args.body[0].type === "array" &&
    args.body[0].body[0] &&
    args.body[0].body[0].body.length > 1 &&
    ["args", "args_add_star"].includes(args.body[0].body[0].type)
  ) {
    steps = steps.concat("body", 0, "body", 0);
  }

  // Now that we've established which actual node is the arguments to return,
  // we grab it out of the path by diving down the steps that we've set up.
  const parts = path.call.apply(path, [print].concat(steps));

  // If we got the value straight out of the parens, then `parts` would only
  // be a singular doc as opposed to an array.
  const value = Array.isArray(parts) ? join(concat([",", line]), parts) : parts;

  return group(
    concat([
      "return",
      ifBreak(parts.length > 1 ? " [" : "(", " "),
      indent(concat([softline, value])),
      concat([softline, ifBreak(parts.length > 1 ? "]" : ")", "")])
    ])
  );
};

module.exports = {
  return: printReturn,
  return0: literal("return")
};
