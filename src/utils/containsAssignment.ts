import type { Ruby } from "../types";

// If the node is a type of assignment or if the node is a paren and nested
// inside that paren is a node that is a type of assignment.
function containsAssignment(node: Ruby.AnyNode | Ruby.Stmts) {
  if (!node) {
    return false;
  }

  if (["assign", "massign", "opassign"].includes(node.type)) {
    return true;
  }

  const anyNode = node as any;
  return Array.isArray(anyNode.body) && anyNode.body.some(containsAssignment);
}

export default containsAssignment;
