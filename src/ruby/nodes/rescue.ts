import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literal } from "../../utils";

const { align, group, hardline, indent, join, line } = prettier;

export const printBegin: Plugin.Printer<Ruby.Begin> = (path, opts, print) => {
  return [
    "begin",
    indent([hardline, path.map(print, "body")]),
    hardline,
    "end"
  ];
};

export const printEnsure: Plugin.Printer<Ruby.Ensure> = (path, opts, print) => {
  return [
    path.call(print, "body", 0),
    indent([hardline, path.call(print, "body", 1)])
  ];
};

export const printRescue: Plugin.Printer<Ruby.Rescue> = (path, opts, print) => {
  const parts: Plugin.Doc[] = ["rescue"];

  if (path.getValue().body[0]) {
    parts.push(align("rescue ".length, path.call(print, "body", 0)));
  } else {
    // If you don't specify an error to rescue in a `begin/rescue` block, then
    // implicitly you're rescuing from `StandardError`. In this case, we're
    // just going to explicitly add it.
    parts.push(" StandardError");
  }

  const bodystmt = path.call(print, "body", 1) as Plugin.Doc[];

  if (bodystmt.length > 0) {
    parts.push(indent([hardline, bodystmt]));
  }

  // This is the next clause on the `begin` statement, either another
  // `rescue`, and `ensure`, or an `else` clause.
  if (path.getValue().body[2]) {
    parts.push([hardline, path.call(print, "body", 2)]);
  }

  return group(parts);
};

// This is a container node that we're adding into the AST that isn't present in
// Ripper solely so that we have a nice place to attach inline comments.
export const printRescueEx: Plugin.Printer<Ruby.RescueEx> = (
  path,
  opts,
  print
) => {
  const [exception, variable] = path.getValue().body;
  const parts = [];

  if (exception) {
    let exceptionDoc = path.call(print, "body", 0);

    if (Array.isArray(exceptionDoc)) {
      const joiner = [",", line];
      exceptionDoc = group(join(joiner, exceptionDoc));
    }

    parts.push(" ", exceptionDoc);
  }

  if (variable) {
    parts.push(" => ", path.call(print, "body", 1));
  }

  return group(parts);
};

export const printRescueMod: Plugin.Printer<Ruby.RescueModifier> = (
  path,
  opts,
  print
) => {
  const [statementDoc, valueDoc] = path.map(print, "body");

  return [
    "begin",
    indent([hardline, statementDoc]),
    hardline,
    "rescue StandardError",
    indent([hardline, valueDoc]),
    hardline,
    "end"
  ];
};

export const printRedo = literal("redo");
export const printRetry = literal("retry");
