const { breakParent, concat, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const isCall = node => ["::", "."].includes(node) || node.type === "@period";

// If you have a simple block that only calls a method on the single required
// parameter that is passed to it, then you can replace that block with the
// simpler `Symbol#to_proc`. Meaning, it would go from:
//
//     [1, 2, 3].map { |i| i.to_s }
//
// to:
//
//     [1, 2, 3].map(&:to_s)
//
// This additionally works with `do` blocks as well.
const toProcTransform = path => {
  const [variables, blockContents] = path.getValue().body;

  // Ensure that there are variables being passed to this block.
  const params = variables && variables.body[0];
  if (!params || params.type !== "params") {
    return null;
  }

  // Ensure there is one and only one parameter, and that it is required.
  const reqParams = params.body[0];
  const otherParams = params.body.slice(1);
  if (!Array.isArray(reqParams) || reqParams.length !== 1 || otherParams.some(Boolean)) {
    return null;
  }

  let statements;
  if (blockContents.type === "bodystmt") {
    // We’re in a `do` block
    const blockStatements = blockContents.body[0];
    const rescueElseEnsure = blockStatements.body.slice(1);

    // You can’t use the to_proc shortcut if you’re rescuing
    if (rescueElseEnsure.some(Boolean)) {
      return null;
    }

    statements = blockStatements;
  } else {
    // We’re in a brace block
    statements = blockContents;
  }

  // Ensure the block contains only one statement
  if (statements.body.length !== 1) {
    return null;
  }

  // Ensure that statement is a call
  const [statement] = statements.body;
  if (statement.type !== "call") {
    return null;
  }

  // Ensure the call is a method of the block argument
  const [varRef, call, method, args] = statement.body;

  if (
    varRef.type === "var_ref"
    && varRef.body[0].body === reqParams[0].body
    && isCall(call)
    && method.type === "@ident"
    && !args
  ) {
    if (["command", "command_call"].includes(path.getParentNode().body[0].type)) {
      return `, &:${method.body}`;
    }

    return `(&:${method.body})`;
  }

  return null;
};

const printBlock = (path, opts, print) => {
  const toProcResponse = toProcTransform(path);
  if (toProcResponse) {
    return toProcResponse;
  }

  const [variables, statements] = path.getValue().body;
  const stmts = statements.type === "stmts" ? statements.body : statements.body[0].body;

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

  // We can hit this next pattern if within the block the only statement is a
  // comment.
  if (stmts.length > 1 && stmts.filter(stmt => stmt.type !== "@comment").length === 1) {
    return concat([breakParent, doBlock]);
  }

  // If the parent node is a command node, then there are no parentheses around
  // the arguments to that command, so we need to break the block
  if (["command", "command_call"].includes(path.getParentNode().body[0].type)) {
    return concat([breakParent, doBlock]);
  }

  const braceBlock = concat([
    " { ",
    variables ? path.call(print, "body", 0) : "",
    path.call(print, "body", 1),
    " }"
  ]);

  return group(ifBreak(doBlock, braceBlock));
};

module.exports = {
  brace_block: printBlock,
  do_block: printBlock
};
