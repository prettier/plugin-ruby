import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { hasAncestor } from "../../utils";

const { breakParent, group, ifBreak, indent, join, removeLines, softline } =
  prettier;

export const printBlockVar: Plugin.Printer<Ruby.BlockVar> = (
  path,
  opts,
  print
) => {
  const parts = ["|", removeLines(path.call(print, "body", 0))];

  // The second part of this node is a list of optional block-local variables
  if (path.getValue().body[1]) {
    parts.push("; ", join(", ", path.map(print, "body", 1)));
  }

  parts.push("| ");
  return parts;
};

// You have to go through the main print function if you could potentially have
// comments attached. So we're doing this weird reflection on the printed docs
// to retroactively change the printed keyword depending on if we're using
// braces or not. Ideally we wouldn't do this, we would instead do this
// reflection in the child printer, but this keeps the logic to just this file
// and contains it, so keeping it here for now.
function printBlockBeging(
  path: Plugin.Path<Ruby.Lbrace | Ruby.Keyword>,
  print: Plugin.Print,
  useBraces: boolean
) {
  let docs = print(path);
  const doc = useBraces ? "{" : "do";

  if (Array.isArray(docs)) {
    docs[1] = doc;
  } else {
    docs = doc;
  }

  return docs;
}

type Block = Ruby.BraceBlock | Ruby.DoBlock;

function printBlock(braces: boolean): Plugin.Printer<Block> {
  return function printBlockWithBraces(path, opts, print) {
    const [variables, statements] = path.getValue().body;
    const stmts =
      statements.type === "stmts" ? statements.body : statements.body[0].body;

    let doBlockBody: Plugin.Doc = "";
    if (
      stmts.length !== 1 ||
      stmts[0].type !== "void_stmt" ||
      stmts[0].comments
    ) {
      doBlockBody = indent([softline, path.call(print, "body", 1)]);
    }

    // If this block is nested underneath a command or command_call node, then
    // we can't use `do...end` because that will get associated with the parent
    // node as opposed to the current node (because of the difference in
    // operator precedence). Instead, we still use a multi-line format but
    // switch to using braces instead.
    const useBraces = braces && hasAncestor(path, ["command", "command_call"]);

    const doBlock = [
      " ",
      path.call(
        (begingPath) => printBlockBeging(begingPath, print, useBraces),
        "beging"
      ),
      variables ? [" ", path.call(print, "body", 0)] : "",
      doBlockBody,
      [softline, useBraces ? "}" : "end"]
    ];

    // We can hit this next pattern if within the block the only statement is a
    // comment.
    if (
      stmts.length === 1 &&
      stmts[0].type === "void_stmt" &&
      stmts[0].comments
    ) {
      return [breakParent, doBlock];
    }

    const blockReceiver = path.getParentNode().body[0];

    // If the parent node is a command node, then there are no parentheses
    // around the arguments to that command, so we need to break the block
    if (["command", "command_call"].includes(blockReceiver.type)) {
      return [breakParent, doBlock];
    }

    const hasBody = stmts.some(({ type }) => type !== "void_stmt");
    const braceBlock = [
      " ",
      path.call(
        (begingPath) => printBlockBeging(begingPath, print, true),
        "beging"
      ),
      hasBody || variables ? " " : "",
      variables ? path.call(print, "body", 0) : "",
      path.call(print, "body", 1),
      hasBody ? " " : "",
      "}"
    ];

    return group(ifBreak(doBlock, braceBlock));
  };
}

export const printBraceBlock = printBlock(true);
export const printDoBlock = printBlock(false);
