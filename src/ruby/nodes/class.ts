import type { Plugin, Ruby } from "./types";

const { concat, group, hardline, indent } = require("../../prettier");
import { isEmptyBodyStmt } from "../../utils";

export const printClass: Plugin.Printer<Ruby.Class> = (path, opts, print) => {
  const [_constant, superclass, bodystmt] = path.getValue().body;

  const parts = ["class ", path.call(print, "body", 0)];
  if (superclass) {
    parts.push(" < ", path.call(print, "body", 1));
  }

  const declaration = group(concat(parts));
  if (isEmptyBodyStmt(bodystmt)) {
    return group(concat([declaration, hardline, "end"]));
  }

  return group(
    concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ])
  );
};

export const printModule: Plugin.Printer<Ruby.Module> = (path, opts, print) => {
  const node = path.getValue();
  const declaration = group(concat(["module ", path.call(print, "body", 0)]));

  if (isEmptyBodyStmt(node.body[1])) {
    return group(concat([declaration, hardline, "end"]));
  }

  return group(
    concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, "end"])
    ])
  );
};

export const printSClass: Plugin.Printer<Ruby.Sclass> = (path, opts, print) => {
  const bodystmt = path.getValue().body[1];
  const declaration = concat(["class << ", path.call(print, "body", 0)]);

  if (isEmptyBodyStmt(bodystmt)) {
    return group(concat([declaration, hardline, "end"]));
  }

  return group(
    concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, "end"])
    ])
  );
};
