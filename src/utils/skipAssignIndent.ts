import type { Ruby } from "../types";

const skippable = [
  "array",
  "dyna_symbol",
  "hash",
  "heredoc",
  "lambda",
  "regexp_literal"
];

function skipAssignIndent(node: Ruby.AnyNode): boolean {
  return (
    skippable.includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.body[0]))
  );
}

export default skipAssignIndent;
