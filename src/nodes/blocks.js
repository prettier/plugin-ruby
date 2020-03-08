const {
  breakParent,
  concat,
  group,
  ifBreak,
  indent,
  join,
  removeLines,
  softline
} = require("../prettier");
const { empty, hasAncestor } = require("../utils");

const printBraceBlock = (path, opts, print) => {
  const [variables, statements] = path.getValue().body;
  const stmts =
    statements.type === "stmts" ? statements.body : statements.body[0].body;

  let doBlockBody = "";
  if (stmts.length !== 1 || stmts[0].type !== "void_stmt") {
    doBlockBody = indent(concat([softline, path.call(print, "body", 1)]));
  }

  // If this block is nested underneath a command or command_call node, then we
  // can't use `do...end` because that will get associated with the parent node
  // as opposed to the current node (because of the difference in operator
  // precedence). Instead, we still use a multi-line format but switch to using
  // braces instead.
  const useBraces = hasAncestor(path, ["command", "command_call"]);

  const doBlock = concat([
    useBraces ? " {" : " do",
    variables ? concat([" ", path.call(print, "body", 0)]) : "",
    doBlockBody,
    concat([softline, useBraces ? "}" : "end"])
  ]);

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

const printDoBlock = (path, opts, print) => {
  const [variables, statements] = path.getValue().body;
  const stmts =
    statements.type === "stmts" ? statements.body : statements.body[0].body;

  let doBlockBody = "";
  if (stmts.length !== 1 || stmts[0].type !== "void_stmt") {
    doBlockBody = indent(concat([softline, path.call(print, "body", 1)]));
  }

  const doBlock = concat([
    " do",
    variables ? concat([" ", path.call(print, "body", 0)]) : "",
    doBlockBody,
    concat([softline, "end"])
  ]);

  return concat([breakParent, doBlock]);
};

module.exports = {
  block_var: (path, opts, print) => {
    const parts = ["|", removeLines(path.call(print, "body", 0))];

    // The second part of this node is a list of optional block-local variables
    if (path.getValue().body[1]) {
      parts.push("; ", join(", ", path.map(print, "body", 1)));
    }

    parts.push("| ");
    return concat(parts);
  },
  brace_block: printBraceBlock,
  do_block: printDoBlock,
  excessed_comma: empty
};
