import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { align, group, join, line } = prettier;

export const printSuper: Plugin.Printer<Ruby.Super> = (path, opts, print) => {
  const { args } = path.getValue();

  if (args.type === "arg_paren") {
    // In case there are explicitly no arguments but they are using parens,
    // we assume they are attempting to override a parent method and pass no
    // arguments up.
    return args.args === null ? "super()" : ["super", path.call(print, "args")];
  }

  const keyword = "super ";

  return group([
    keyword,
    align(keyword.length, group(join([",", line], path.call(print, "args"))))
  ]);
};

// Version of super without any parens or args.
export const printZSuper: Plugin.Printer<Ruby.Zsuper> = (path) =>
  path.getValue().value;
