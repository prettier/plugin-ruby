const { concat, group, indent, join, line } = require("../prettier");
const { concatBody, first, skipAssignIndent } = require("../utils");

module.exports = {
  assign: (path, opts, print) => {
    const [printedTarget, printedValue] = path.map(print, "body");
    let adjustedValue = printedValue;

    if (
      ["mrhs_add_star", "mrhs_new_from_args"].includes(
        path.getValue().body[1].type
      )
    ) {
      adjustedValue = group(join(concat([",", line]), printedValue));
    }

    if (skipAssignIndent(path.getValue().body[1])) {
      return group(concat([printedTarget, " = ", adjustedValue]));
    }

    return group(
      concat([printedTarget, " =", indent(concat([line, adjustedValue]))])
    );
  },
  assign_error: (_path, _opts, _print) => {
    throw new Error("Can't set variable");
  },
  opassign: (path, opts, print) =>
    group(
      concat([
        path.call(print, "body", 0),
        " ",
        path.call(print, "body", 1),
        indent(concat([line, path.call(print, "body", 2)]))
      ])
    ),
  var_field: concatBody,
  var_ref: first
};
