import type { Ruby } from "../types";

function isEmptyStmts(node: Ruby.AnyNode | Ruby.Stmts) {
  return (
    node &&
    node.type === "stmts" &&
    node.body.length === 1 &&
    node.body[0].type === "void_stmt" &&
    !node.body[0].comments
  );
}

export default isEmptyStmts;
