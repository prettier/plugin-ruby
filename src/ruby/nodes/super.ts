import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literal } from "../../utils";

const { align, group, join, line } = prettier;

export const printSuper: Plugin.Printer<Ruby.Super> = (path, opts, print) => {
  const args = path.getValue().body[0];

  if (args.type === "arg_paren") {
    // In case there are explicitly no arguments but they are using parens,
    // we assume they are attempting to override the initializer and pass no
    // arguments up.
    if (args.body[0] === null) {
      return "super()";
    }

    return ["super", path.call(print, "body", 0)];
  }

  const keyword = "super ";
  const argsDocs = path.call(print, "body", 0);

  return group([
    keyword,
    align(keyword.length, group(join([",", line], argsDocs)))
  ]);
};

// Version of super without any parens or args.
export const printZSuper = literal("super");
