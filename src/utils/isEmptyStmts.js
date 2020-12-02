const isEmptyStmts = (node) =>
  node &&
  node.type === "stmts" &&
  node.body.length === 1 &&
  node.body[0].type === "void_stmt";

module.exports = isEmptyStmts;
