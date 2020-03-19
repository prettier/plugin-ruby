const handleOwnLineComment = (comment, text, opts, ast, isLastComment) => {
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
