const { concat, group, ifBreak, indent, softline } = require("prettier").doc.builders;

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
  const [variables, statements] = path.getValue().body;

  // Ensure that there are variables being passed to this block.
  const params = variables && variables.body[0];
  if (!params || params.type !== "params") {
    return;
  }

  // Ensure there is one and only one parameter, and that it is required.
  const reqParams = params.body[0];
  if (params.body.slice(1).some(varType => varType) || reqParams.length !== 1) {
    return;
  }

  const statementTypes = statements.body.map(statement => statement && statement.type);
  let callBody;

  // If the statement types match this pattern, we're in a brace block with an
  // eligible block.
  if (statementTypes.length === 2 && statementTypes[0] === "stmts_new" && statementTypes[1] === "call") {
    callBody = statements.body[1].body;
  }

  // If the statement types match this pattern, we're in a `do` block with an
  // eligible block.
  if (statementTypes.length === 4 && statementTypes[0] === "stmts_add" && statementTypes.slice(1).every(statementType => !statementType)) {
    callBody = statements.body[0].body[1].body;
  }

  // If we have a call, then we can compare to ensure the variables are the
  // same.
  if (callBody && callBody[0] && callBody[0].type === "var_ref" && callBody[0].body[0].body === reqParams[0].body && callBody[1].type === "@period") {
    return `(&:${reqParams[0].body})`;
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
  const firstStatement = statements.body[0];
  if (firstStatement.type === "stmts_add" && firstStatement.body[0].type === "stmts_add" && firstStatement.body[1].type === "void_stmt") {
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
