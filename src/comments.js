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

const endOfLine = (comment, _text, _opts, _ast, isLastComment) => {
  const { enclosingNode } = comment;
  if (!enclosingNode) {
    return false;
  }

  if (enclosingNode.type === "aref") {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  if (
    enclosingNode.type === "assign" &&
    enclosingNode.body[0].type === "aref_field"
  ) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  if (enclosingNode.type === "args_forward") {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  // prevent `super 1, 2 # comment` from breaking the args bc of the comment
  if (enclosingNode.type === "super" && isLastComment) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  return false;
};

const remaining = (comment, _text, _opts, _ast, isLastComment) => {
  const { enclosingNode } = comment;
  if (!enclosingNode) {
    return false;
  }

  // prevent `super 1, 2 # comment` from breaking the args bc of the comment
  if (enclosingNode.type === "super" && isLastComment) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }

  return false;
};

module.exports = {
  ownLine,
  endOfLine,
  remaining
};
