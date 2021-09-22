import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { isEmptyBodyStmt } from "../../utils";

const { group, hardline, indent } = prettier;

export const printClass: Plugin.Printer<Ruby.Class> = (path, opts, print) => {
  const [, superclass, bodystmt] = path.getValue().body;

  const parts = ["class ", path.call(print, "body", 0)];
  if (superclass) {
    parts.push(" < ", path.call(print, "body", 1));
  }

  const declaration = group(parts);
  if (isEmptyBodyStmt(bodystmt)) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "body", 2)]),
    [hardline, "end"]
  ]);
};

export const printModule: Plugin.Printer<Ruby.Module> = (path, opts, print) => {
  const node = path.getValue();
  const declaration = group(["module ", path.call(print, "body", 0)]);

  if (isEmptyBodyStmt(node.body[1])) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "body", 1)]),
    hardline,
    "end"
  ]);
};

export const printSClass: Plugin.Printer<Ruby.Sclass> = (path, opts, print) => {
  const bodystmt = path.getValue().body[1];
  const declaration = ["class << ", path.call(print, "body", 0)];

  if (isEmptyBodyStmt(bodystmt)) {
    return group([declaration, hardline, "end"]);
  }

  return group([
    declaration,
    indent([hardline, path.call(print, "body", 1)]),
    hardline,
    "end"
  ]);
};
