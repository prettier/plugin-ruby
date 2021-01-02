const { concat, group, indent, join, line } = require("../../prettier");
const { skipAssignIndent } = require("../../utils");

function printAssign(path, opts, print) {
  const [_targetNode, valueNode] = path.getValue().body;
  const [targetDoc, valueDoc] = path.map(print, "body");

  let rightSideDoc = valueDoc;

  // If the right side of this assignment is a multiple assignment, then we need
  // to join it together with commas.
  if (["mrhs_add_star", "mrhs_new_from_args"].includes(valueNode.type)) {
    rightSideDoc = group(join(concat([",", line]), valueDoc));
  }

  if (skipAssignIndent(valueNode)) {
    return group(concat([targetDoc, " = ", rightSideDoc]));
  }

  return group(concat([targetDoc, " =", indent(concat([line, rightSideDoc]))]));
}

function printOpAssign(path, opts, print) {
  return group(
    concat([
      path.call(print, "body", 0),
      " ",
      path.call(print, "body", 1),
      indent(concat([line, path.call(print, "body", 2)]))
    ])
  );
}

function printVarField(path, opts, print) {
  return path.getValue().body ? path.call(print, "body", 0) : "";
}

function printVarRef(path, opts, print) {
  return path.call(print, "body", 0);
}

module.exports = {
  assign: printAssign,
  opassign: printOpAssign,
  var_field: printVarField,
  var_ref: printVarRef
};
