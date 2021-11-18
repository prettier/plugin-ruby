import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { join } = prettier;

// If there are parentheses around these nodes, then we can't skip printing them
// without changing the semantic meaning of the statement.
const unskippableParens = [
  "if_mod",
  "rescue_mod",
  "unless_mod",
  "until_mod",
  "while_mod"
];

type FlowControl = Ruby.Break | Ruby.Next;

function printFlowControl(keyword: string): Plugin.Printer<FlowControl> {
  return function printFlowControlWithKeyword(path, opts, print) {
    const node = path.getValue();

    // If we don't have any arguments to the keyword, then it's always going to
    // come in as an args node, in which case we can just print the keyword.
    if (node.args.type === "args") {
      return keyword;
    }

    // Special handling if we've got parentheses on this call to the keyword. If
    // we do and we can skip them, then we will. If we don't, then we'll print
    // them right after the keyword with no space.
    const paren = node.args.args.type === "args" && node.args.args.parts[0];

    if (paren && paren.type === "paren") {
      const stmts = (paren.cnts as Ruby.Statements).body;

      // Here we're checking if we can skip past the parentheses entirely.
      if (stmts.length === 1 && !unskippableParens.includes(stmts[0].type)) {
        return [
          `${keyword} `,
          (path as any).call(print, "args", "args", "parts", 0, "cnts")
        ];
      }

      // Here we know we can't, so just printing out the parentheses as normal.
      return [keyword, (path as any).call(print, "args", "args", "parts", 0)];
    }

    // If we didn't hit the super special handling, then we're just going to
    // print out the arguments to the keyword like normal.
    return [`${keyword} `, join(", ", path.call(print, "args"))];
  };
}

export const printBreak = printFlowControl("break");

export const printNext = printFlowControl("next");

export const printYield: Plugin.Printer<Ruby.Yield> = (path, opts, print) => {
  const node = path.getValue();
  const argsDoc = path.call(print, "args");

  if (node.args.type === "paren") {
    return ["yield", argsDoc];
  }

  return ["yield ", join(", ", argsDoc)];
};

export const printYield0: Plugin.Printer<Ruby.Yield0> = (path) =>
  path.getValue().value;
