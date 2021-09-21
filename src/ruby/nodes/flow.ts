import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literal } from "../../utils";

const { concat, join } = prettier;

function nodeDive(node: any, steps: PropertyKey[]) {
  let current = node;

  steps.forEach((step) => {
    current = current[step];
  });

  return current;
}

const unskippableParens = [
  "if_mod",
  "rescue_mod",
  "unless_mod",
  "until_mod",
  "while_mod"
];

type CallArgs = [Plugin.Print, ...PropertyKey[]];

function maybeHandleParens(
  path: Plugin.Path<Ruby.Break | Ruby.Next>,
  print: Plugin.Print,
  keyword: string,
  steps: PropertyKey[]
) {
  const node = nodeDive(path.getValue(), steps);
  if (node.type !== "paren") {
    return null;
  }

  let args = [print] as CallArgs;
  const stmts = node.body[0].body;

  if (stmts.length === 1 && !unskippableParens.includes(stmts[0].type)) {
    args = args.concat(steps).concat("body", 0) as CallArgs;
    return concat([`${keyword} `, path.call.apply(path, args) as Plugin.Doc]);
  }

  args = args.concat(steps) as CallArgs;
  return concat([keyword, path.call.apply(path, args) as Plugin.Doc]);
}

export const printBreak: Plugin.Printer<Ruby.Break> = (path, opts, print) => {
  const content = path.getValue().body[0];

  if (content.body.length === 0) {
    return "break";
  }

  const steps = ["body", 0, "body", 0, "body", 0];
  return (
    maybeHandleParens(path, print, "break", steps) ||
    concat(["break ", join(", ", path.call(print, "body", 0))])
  );
};

export const printNext: Plugin.Printer<Ruby.Next> = (path, opts, print) => {
  const args = path.getValue().body[0].body[0];

  if (!args) {
    return "next";
  }

  const steps = ["body", 0, "body", 0, "body", 0];
  return (
    maybeHandleParens(path, print, "next", steps) ||
    concat(["next ", join(", ", path.call(print, "body", 0))])
  );
};

export const printYield: Plugin.Printer<Ruby.Yield> = (path, opts, print) => {
  if (path.getValue().body[0].type === "paren") {
    return concat(["yield", path.call(print, "body", 0)]);
  }

  return concat(["yield ", join(", ", path.call(print, "body", 0))]);
};

export const printYield0 = literal("yield");
