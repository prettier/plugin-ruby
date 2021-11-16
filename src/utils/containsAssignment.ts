import type { Ruby } from "../types";
import getChildNodes from "./getChildNodes";

// If the node is a type of assignment or if the node is a paren and nested
// inside that paren is a node that is a type of assignment.
function containsAssignment(node: null | Ruby.AnyNode | Ruby.Statements) {
  if (!node) {
    return false;
  }

  if (["assign", "massign", "opassign"].includes(node.type)) {
    return true;
  }

  return getChildNodes(node).some(containsAssignment);
}

export default containsAssignment;
