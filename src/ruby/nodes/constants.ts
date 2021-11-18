import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { makeCall } from "../../utils";

const { group, indent, softline } = prettier;

type ConstPath = Ruby.ConstPathField | Ruby.ConstPathRef;
export const printConstPath: Plugin.Printer<ConstPath> = (
  path,
  opts,
  print
) => [path.call(print, "parent"), "::", path.call(print, "constant")];

export const printConstRef: Plugin.Printer<Ruby.ConstRef> = (
  path,
  opts,
  print
) => path.call(print, "constant");

export const printDefined: Plugin.Printer<Ruby.Defined> = (
  path,
  opts,
  print
) => {
  return group([
    "defined?(",
    indent([softline, path.call(print, "value")]),
    softline,
    ")"
  ]);
};

export const printField: Plugin.Printer<Ruby.Field> = (path, opts, print) => {
  return group([
    path.call(print, "parent"),
    makeCall(path, opts, print),
    path.call(print, "name")
  ]);
};

type TopConst = Ruby.TopConstField | Ruby.TopConstRef;
export const printTopConst: Plugin.Printer<TopConst> = (path, opts, print) => [
  "::",
  path.call(print, "constant")
];
