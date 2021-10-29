import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { isEmptyBodyStmt } from "../../utils";

const { group, hardline, indent } = prettier;

export const printClass: Plugin.Printer<Ruby.Class> = (path, opts, print) => {
  const node = path.getValue();

  const parts = ["class ", path.call(print, "constant")];
  if (node.superclass) {
    parts.push(" < ", path.call(print, "superclass"));
  }

  const declaration = group(parts);
  if (isEmptyBodyStmt(node.bodystmt)) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "bodystmt")]),
    [hardline, "end"]
  ]);
};

export const printModule: Plugin.Printer<Ruby.Module> = (path, opts, print) => {
  const node = path.getValue();
  const declaration = group(["module ", path.call(print, "constant")]);

  if (isEmptyBodyStmt(node.bodystmt)) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "bodystmt")]),
    hardline,
    "end"
  ]);
};

export const printSClass: Plugin.Printer<Ruby.Sclass> = (path, opts, print) => {
  const node = path.getValue();
  const declaration = ["class << ", path.call(print, "target")];

  if (isEmptyBodyStmt(node.bodystmt)) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "bodystmt")]),
    hardline,
    "end"
  ]);
};
