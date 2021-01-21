const isEmptyStmts = require("./isEmptyStmts");

function isEmptyBodyStmt(node) {
  return isEmptyStmts(node.body[0]) && !node.body.slice(1).some(Boolean);
}

module.exports = isEmptyBodyStmt;
