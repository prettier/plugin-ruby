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

// Prevent `super 1, 2 # comment` from breaking the args because of the comment
function handleSuperLastComment(comment, isLastComment) {
  const { enclosingNode } = comment;

  if (enclosingNode && enclosingNode.type === "super" && isLastComment) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function ownLine(comment, _text, _opts, _ast, _isLastComment) {
  return handleEmptyStmtsComments(comment);
}

function endOfLine(comment, _text, _opts, _ast, isLastComment) {
  return handleSuperLastComment(comment, isLastComment);
}

function remaining(comment, _text, _opts, _ast, isLastComment) {
  return handleSuperLastComment(comment, isLastComment);
}

module.exports = {
  ownLine,
  endOfLine,
  remaining
};
