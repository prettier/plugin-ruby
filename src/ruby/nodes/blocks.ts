import type { Plugin, Ruby } from "../types";

const {
  breakParent,
  concat,
  group,
  ifBreak,
  indent,
  join,
  removeLines,
  softline
} = require("../../prettier");
import { hasAncestor } from "../../utils";

export const printBlockVar: Plugin.Printer<Ruby.BlockVar> = (path, opts, print) => {
  const parts = ["|", removeLines(path.call(print, "body", 0))];

  // The second part of this node is a list of optional block-local variables
  if (path.getValue().body[1]) {
    parts.push("; ", join(", ", path.map(print, "body", 1)));
  }

  parts.push("| ");
  return concat(parts);
};

function printBlock(braces: boolean): Plugin.Printer<Ruby.BraceBlock | Ruby.DoBlock> {
  return function printBlockWithBraces(path, opts, print) {
    const [variables, statements] = path.getValue().body;
    const stmts =
      statements.type === "stmts" ? statements.body : statements.body[0].body;

    let doBlockBody = "";
    if (
      stmts.length !== 1 ||
      stmts[0].type !== "void_stmt" ||
      stmts[0].comments
    ) {
      doBlockBody = indent(concat([softline, path.call(print, "body", 1)]));
    }

    // If this block is nested underneath a command or command_call node, then
    // we can't use `do...end` because that will get associated with the parent
    // node as opposed to the current node (because of the difference in
    // operator precedence). Instead, we still use a multi-line format but
    // switch to using braces instead.
    const useBraces = braces && hasAncestor(path, ["command", "command_call"]);

    const doBlock = concat([
      useBraces ? " {" : " do",
      variables ? concat([" ", path.call(print, "body", 0)]) : "",
      doBlockBody,
      concat([softline, useBraces ? "}" : "end"])
    ]);

    // We can hit this next pattern if within the block the only statement is a
    // comment.
    if (
      stmts.length === 1 &&
      stmts[0].type === "void_stmt" &&
      stmts[0].comments
    ) {
      return concat([breakParent, doBlock]);
    }

    const blockReceiver = path.getParentNode().body[0];

    // If the parent node is a command node, then there are no parentheses
    // around the arguments to that command, so we need to break the block
    if (["command", "command_call"].includes(blockReceiver.type)) {
      return concat([breakParent, doBlock]);
    }

    const hasBody = stmts.some(({ type }) => type !== "void_stmt");
    const braceBlock = concat([
      " {",
      hasBody || variables ? " " : "",
      variables ? path.call(print, "body", 0) : "",
      path.call(print, "body", 1),
      hasBody ? " " : "",
      "}"
    ]);

    return group(ifBreak(doBlock, braceBlock));
  };
}

export const printBraceBlock = printBlock(true);
export const printDoBlock = printBlock(false);
