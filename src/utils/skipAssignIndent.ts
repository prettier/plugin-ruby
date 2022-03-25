import type { Ruby } from "../types";

const skippable = [
  "array",
  "dyna_symbol",
  "hash",
  "heredoc",
  "lambda",
  "qsymbols",
  "qwords",
  "regexp_literal",
  "symbols",
  "words"
];

function skipAssignIndent(node: Ruby.AnyNode): boolean {
  return (
    skippable.includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.receiver))
  );
}

export default skipAssignIndent;
