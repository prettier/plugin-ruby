const { addLeadingComment } = require("./prettier");

const isEmptyStmts = (node) =>
  node.type === "stmts" &&
  node.body.length === 1 &&
  node.body[0].type === "void_stmt";

const handleOwnLineComment = (comment, text, opts, ast, isLastComment) => {
  if (isEmptyStmts(comment.precedingNode)) {
    addLeadingComment(comment.precedingNode, comment);
    return true;
  }

  return false;
};

const handleEndOfLineComment = (comment, text, opts, ast, isLastComment) => {
  return false;
};

const handleRemainingComment = (comment, text, opts, ast, isLastComment) => {
  return false;
};

module.exports = {
  ownLine: handleOwnLineComment,
  endOfLine: handleEndOfLineComment,
  remaining: handleRemainingComment
};
