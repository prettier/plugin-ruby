const skippable = [
  "array",
  "dyna_symbol",
  "hash",
  "heredoc",
  "lambda",
  "regexp_literal"
];

function skipAssignIndent(node) {
  return (
    skippable.includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.body[0]))
  );
}

module.exports = skipAssignIndent;
