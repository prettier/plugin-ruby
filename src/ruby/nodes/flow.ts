import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literal } from "../../utils";

const { join } = prettier;

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

  const stmts = node.body[0].body;
  if (stmts.length === 1 && !unskippableParens.includes(stmts[0].type)) {
    return [`${keyword} `, (path as any).call(print, ...steps, "body", 0)];
  }

  return [keyword, (path as any).call(print, ...steps)];
}

export const printBreak: Plugin.Printer<Ruby.Break> = (path, opts, print) => {
  const content = path.getValue().body[0];

  if (content.body.length === 0) {
    return "break";
  }

  const steps = ["body", 0, "body", 0, "body", 0];
  return (
    maybeHandleParens(path, print, "break", steps) || [
      "break ",
      join(", ", path.call(print, "body", 0))
    ]
  );
};

export const printNext: Plugin.Printer<Ruby.Next> = (path, opts, print) => {
  const args = path.getValue().body[0].body[0];

  if (!args) {
    return "next";
  }

  const steps = ["body", 0, "body", 0, "body", 0];
  return (
    maybeHandleParens(path, print, "next", steps) || [
      "next ",
      join(", ", path.call(print, "body", 0))
    ]
  );
};

export const printYield: Plugin.Printer<Ruby.Yield> = (path, opts, print) => {
  if (path.getValue().body[0].type === "paren") {
    return ["yield", path.call(print, "body", 0)];
  }

  return ["yield ", join(", ", path.call(print, "body", 0))];
};

export const printYield0 = literal("yield");
