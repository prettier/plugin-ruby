import type { Ruby } from "../types";

function isEmptyStmts(node: Ruby.AnyNode | Ruby.Statements) {
  return (
    node &&
    node.type === "statements" &&
    node.body.length === 1 &&
    node.body[0].type === "void_stmt" &&
    !node.body[0].comments
  );
}

export default isEmptyStmts;
