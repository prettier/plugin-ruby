import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { skipAssignIndent } from "../../utils";
import { Doc, Path } from "../../types/plugin";

const { group, indent, join, line } = prettier;

export const printAssign: Plugin.Printer<Ruby.Assign> = (...args) => {
  return printOpAssignOrAssign("=", ...args);
};

export const printOpAssign: Plugin.Printer<Ruby.Opassign | Ruby.Assign> = (
  path,
  opts,
  print
) => {
  const opDoc = path.call(print, "op");
  return printOpAssignOrAssign(opDoc, path, opts, print);
};

function printOpAssignOrAssign(
  opDoc: Doc,
  path: Path<Ruby.Assign | Ruby.Opassign>,
  opts: Plugin.Options,
  print: Plugin.Print
): Doc {
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
    return group([targetDoc, " ", opDoc, " ", rightSideDoc]);
  }

  return group([targetDoc, " ", opDoc, indent([line, rightSideDoc])]);
}

export const printVarField: Plugin.Printer<Ruby.VarField> = (
  path,
  opts,
  print
) => (path.getValue().value ? path.call(print, "value") : "");

export const printVarRef: Plugin.Printer<Ruby.VarRef> = (path, opts, print) =>
  path.call(print, "value");
