const {
  concat,
  group,
  ifBreak,
  indent,
  line,
  softline
} = require("../prettier");
const { hasAncestor, nodeDive } = require("../utils");

// We can have our params coming in as the first child of the main lambda node,
// or if we have them wrapped in parens then they'll be one level deeper. Even
// though it's possible to omit the parens if you only have one argument, we're
// going to keep them in no matter what for consistency.
const printLambdaParams = (path, print) => {
  const steps = ["body", 0];
  let params = nodeDive(path.getValue(), steps);

  if (params.type !== "params") {
    steps.push("body", 0);
    params = nodeDive(path.getValue(), steps);
  }

  // If we don't have any params at all, then we're just going to bail out and
  // print nothing. This is to avoid printing an empty set of parentheses.
  if (params.body.every((type) => !type)) {
    return "";
  }

  return group(
    concat([
      "(",
      indent(concat([softline, path.call.apply(path, [print].concat(steps))])),
      softline,
      ")"
    ])
  );
};

// Lambda nodes represent stabby lambda literals, which can come in a couple of
// flavors. They can use either braces or do...end for their block, and their
// arguments can be not present, have no parentheses for a single argument, or
// have parentheses for multiple arguments. Below are a couple of examples:
//
//     -> { 1 }
//     -> a { a + 1 }
//     ->(a) { a + 1 }
//     ->(a, b) { a + b }
//     ->(a, b = 1) { a + b }
//
//     -> do
//       1
//     end
//
//     -> a do
//       a + 1
//     end
//
//     ->(a, b) do
//       a + b
//     end
//
// Generally, we're going to favor do...end for the multi-line form and braces
// for the single-line form. However, if we have an ancestor that is a command
// or command_call node, then we'll need to use braces either way because of
// operator precendence.
const printLambda = (path, opts, print) => {
  const params = printLambdaParams(path, print);
  const inCommand = hasAncestor(path, ["command", "command_call"]);

  return group(
    ifBreak(
      concat([
        "->",
        params,
        " ",
        inCommand ? "{" : "do",
        indent(concat([line, path.call(print, "body", 1)])),
        line,
        inCommand ? "}" : "end"
      ]),
      concat(["->", params, " { ", path.call(print, "body", 1), " }"])
    )
  );
};

module.exports = {
  lambda: printLambda
};
