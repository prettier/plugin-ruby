import type { Ruby } from "../types";
import isEmptyStmts from "./isEmptyStmts";

function isEmptyBodyStmt(node: Ruby.Bodystmt) {
  return isEmptyStmts(node.body[0]) && !node.body.slice(1).some(Boolean);
}

export default isEmptyBodyStmt;
