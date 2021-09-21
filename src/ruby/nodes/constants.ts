import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { makeCall } from "../../utils";

const { group, indent, join, softline } = prettier;

export const printConstPath: Plugin.Printer<
  Ruby.ConstPathField | Ruby.ConstPathRef
> = (path, opts, print) => {
  return join("::", path.map(print, "body"));
};

export const printConstRef: Plugin.Printer<Ruby.ConstRef> = (
  path,
  opts,
  print
) => {
  return path.call(print, "body", 0);
};

export const printDefined: Plugin.Printer<Ruby.Defined> = (
  path,
  opts,
  print
) => {
  return group([
    "defined?(",
    indent([softline, path.call(print, "body", 0)]),
    softline,
    ")"
  ]);
};

export const printField: Plugin.Printer<Ruby.Field> = (path, opts, print) => {
  return group([
    path.call(print, "body", 0),
    makeCall(path, opts, print),
    path.call(print, "body", 2)
  ]);
};

export const printTopConst: Plugin.Printer<
  Ruby.TopConstField | Ruby.TopConstRef
> = (path, opts, print) => {
  return ["::", path.call(print, "body", 0)];
};
