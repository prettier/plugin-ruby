function isEmptyStmts(node) {
  return (
    node &&
    node.type === "stmts" &&
    node.body.length === 1 &&
    node.body[0].type === "void_stmt" &&
    !node.body[0].comments
  );
}

module.exports = isEmptyStmts;
