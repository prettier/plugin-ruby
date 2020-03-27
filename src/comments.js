const { addTrailingComment } = require("./prettier");
const { isEmptyStmts } = require("./utils");

const handleOwnLineComment = (comment, text, opts, ast, isLastComment) => {
  if (isEmptyStmts(comment.precedingNode)) {
    addTrailingComment(comment.precedingNode, comment);
    return true;
  }

  if (isEmptyStmts(comment.followingNode)) {
    addTrailingComment(comment.followingNode, comment);
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
