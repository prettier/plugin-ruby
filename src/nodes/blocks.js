const {
  concat,
  group,
  ifBreak,
  indent,
  softline
} = require("prettier").doc.builders;

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
const toProcTransform = (path, opts, print) => {
  const [variables, blockContents] = path.getValue().body;

  // Ensure that there are variables being passed to this block.
  const params = variables && variables.body[0];
  if (!params || params.type !== "params") {
    return;
  }

  // Ensure there is one and only one parameter, and that it is required.
  const [requiredPositionalParams, ...otherParamTypes] = params.body;
  if (
    !Array.isArray(requiredPositionalParams) ||
    requiredPositionalParams.length !== 1 ||
    otherParamTypes.some(Boolean)
  ) {
    return;
  }

  let statements;
  if (blockContents.type === "bodystmt") {
    // We’re in a `do` block
    const [blockStatements, ...rescueElseEnsure] = blockContents.body;

    // You can’t use the to_proc shortcut if you’re rescuing
    if (rescueElseEnsure.some(Boolean)) return;

    statements = blockStatements;
  } else {
    // We’re in a brace block
    statements = blockContents;
  }

  // Ensure the block contains only one statement
  if (statements.body.length !== 1) return;

  // Ensure that statement is a call
  const [statement] = statements.body;
  if (statement.type !== "call") return;

  // Ensure the call is a method of the block argument
  const [varRef, call, method, args] = statement.body;

  if (
    varRef.type === "var_ref" &&
    varRef.body[0].body === requiredPositionalParams[0].body &&
    isCall(call) &&
    method.type === "@ident" &&
    !args
  ) {
    return `(&:${method.body})`;
  }
};

const printBlock = (path, opts, print) => {
  const toProcResponse = toProcTransform(path, opts, print);
  if (toProcResponse) {
    return toProcResponse;
  }

  const [variables, statements] = path.getValue().body;

  const doBlock = concat([
    " do",
    variables ? concat([" ", path.call(print, "body", 0)]) : "",
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]);

  // We can hit this next pattern if within the block the only statement is a
  // comment.
  const stmts =
    statements.type === "stmts" ? statements.body : statements.body[0].body;
  if (
    stmts.length > 1 &&
    stmts.filter(stmt => stmt.type !== "@comment").length === 1
  ) {
    return doBlock;
  }

  // If the parent node is a command node, then there are no parentheses around
  // the arguments to that command, so we need to break the block
  if (path.getParentNode().body[0].type === "command") {
    return doBlock;
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
