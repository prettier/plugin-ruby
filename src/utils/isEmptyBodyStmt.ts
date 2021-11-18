import type { Ruby } from "../types";
import isEmptyStmts from "./isEmptyStmts";

function isEmptyBodyStmt(node: Ruby.Bodystmt) {
  return isEmptyStmts(node.stmts) && !node.rsc && !node.ens && !node.els;
}

export default isEmptyBodyStmt;
