import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { skipAssignIndent } from "../../utils";

const { group, indent, join, line } = prettier;

export const printAssign: Plugin.Printer<Ruby.Assign> = (path, opts, print) => {
  const valueNode = path.getValue().value;

  const targetDoc = path.call(print, "target");
  const valueDoc = path.call(print, "value");

  let rightSideDoc = valueDoc;

  // If the right side of this assignment is a multiple assignment, then we need
  // to join it together with commas.
  if (
    ["mrhs", "mrhs_add_star", "mrhs_new_from_args"].includes(valueNode.type)
  ) {
    rightSideDoc = group(join([",", line], valueDoc));
  }

  if (skipAssignIndent(valueNode)) {
    return group([targetDoc, " = ", rightSideDoc]);
  }

  return group([targetDoc, " =", indent([line, rightSideDoc])]);
};

export const printOpAssign: Plugin.Printer<Ruby.Opassign> = (
  path,
  opts,
  print
) =>
  group([
    path.call(print, "target"),
    " ",
    path.call(print, "operator"),
    indent([line, path.call(print, "value")])
  ]);

export const printVarField: Plugin.Printer<Ruby.VarField> = (
  path,
  opts,
  print
) => (path.getValue().value ? path.call(print, "value") : "");

export const printVarRef: Plugin.Printer<Ruby.VarRef> = (path, opts, print) =>
  path.call(print, "value");
