const { addTrailingComment } = require("./prettier");
const { isEmptyStmts } = require("./utils");

const ownLine = (comment, _text, _opts, _ast, _isLastComment) => {
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

const endOfLine = (_comment, _text, _opts, _ast, _isLastComment) => {
  return false;
};

const remaining = (_comment, _text, _opts, _ast, _isLastComment) => {
  return false;
};

module.exports = {
  ownLine,
  endOfLine,
  remaining
};
