// If the node is a type of assignment or if the node is a paren and nested
// inside that paren is a node that is a type of assignment.
function containsAssignment(node) {
  return (
    node &&
    (["assign", "massign", "opassign"].includes(node.type) ||
      (Array.isArray(node.body) && node.body.some(containsAssignment)))
  );
}

module.exports = containsAssignment;
