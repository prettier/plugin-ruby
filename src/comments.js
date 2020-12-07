const { addTrailingComment } = require("./prettier");

// Prevent `super 1, 2 # comment` from breaking the args because of the comment
function handleSuperLastComment(comment, isLastComment) {
  const { enclosingNode } = comment;

  if (enclosingNode && enclosingNode.type === "super" && isLastComment) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function ownLine(_comment, _text, _opts, _ast, _isLastComment) {
  return false;
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
