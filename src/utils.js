const { breakParent, concat, hardline, lineSuffix } = require("./prettier");

const concatBody = (path, opts, print) => concat(path.map(print, "body"));

// If the node is a type of assignment or if the node is a paren and nested
// inside that paren is a node that is a type of assignment.
const containsAssignment = (node) =>
  ["assign", "massign"].includes(node.type) ||
  (node.type === "paren" && node.body[0].body.some(containsAssignment));

const docLength = (doc) => {
  if (doc.length) {
    return doc.length;
  }

  if (doc.parts) {
    return doc.parts.reduce((sum, child) => sum + docLength(child), 0);
  }

  if (doc.contents) {
    return docLength(doc.contents);
  }

  return 0;
};

const empty = () => "";

const first = (path, opts, print) => path.call(print, "body", 0);

const hasAncestor = (path, types) => {
  let parent = 0;
  let parentNode = path.getParentNode();

  while (parentNode) {
    if (types.includes(parentNode.type)) {
      return true;
    }

    parent += 1;
    parentNode = path.getParentNode(parent);
  }

  return false;
};

const literal = (value) => () => value;

const makeCall = (path, opts, print) => {
  const operation = path.getValue().body[1];

  if ([".", "&."].includes(operation)) {
    return operation;
  }

  return operation === "::" ? "." : path.call(print, "body", 1);
};

const makeList = (path, opts, print) => path.map(print, "body");

const nodeDive = (node, steps) => {
  let current = node;

  steps.forEach((step) => {
    current = current[step];
  });

  return current;
};

const prefix = (value) => (path, opts, print) =>
  concat([value, path.call(print, "body", 0)]);

const printComments = (printed, start, comments) => {
  let node = printed;

  comments.forEach((comment) => {
    if (comment.start < start) {
      node = concat([
        comment.break ? breakParent : "",
        comment.body,
        hardline,
        node
      ]);
    } else {
      node = concat([
        node,
        comment.break ? breakParent : "",
        lineSuffix(` ${comment.body}`)
      ]);
    }
  });

  return node;
};

const skipAssignIndent = (node) =>
  ["array", "hash", "heredoc", "lambda", "regexp_literal"].includes(
    node.type
  ) ||
  (node.type === "call" && skipAssignIndent(node.body[0])) ||
  (node.type === "string_literal" && node.body[0].type === "heredoc");

const surround = (left, right) => (path, opts, print) =>
  concat([left, path.call(print, "body", 0), right]);

const literallineWithoutBreakParent = {
  type: "line",
  hard: true,
  literal: true
};

module.exports = {
  concatBody,
  containsAssignment,
  docLength,
  empty,
  first,
  hasAncestor,
  literal,
  literallineWithoutBreakParent,
  makeCall,
  makeList,
  nodeDive,
  prefix,
  printComments,
  skipAssignIndent,
  surround
};
