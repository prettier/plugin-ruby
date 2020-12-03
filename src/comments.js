const { addTrailingComment } = require("./prettier");
const { isEmptyStmts } = require("./utils");

function handleEmptyStmtsComments(comment) {
  if (isEmptyStmts(comment.precedingNode)) {
    addTrailingComment(comment.precedingNode, comment);
    return true;
  }

  if (isEmptyStmts(comment.followingNode)) {
    addTrailingComment(comment.followingNode, comment);
    return true;
  }

  return false;
}

function ownLine(comment, _text, _opts, _ast, _isLastComment) {
  return handleEmptyStmtsComments(comment);
}

function endOfLine(_comment, _text, _opts, _ast, _isLastComment) {
  return false;
}

function remaining(_comment, _text, _opts, _ast, _isLastComment) {
  return false;
}

module.exports = {
  ownLine,
  endOfLine,
  remaining
};
