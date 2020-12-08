const { concat } = require("./prettier");
const isEmptyStmts = require("./utils/isEmptyStmts");
const literalLineNoBreak = require("./utils/literalLineNoBreak");

const concatBody = (path, opts, print) => concat(path.map(print, "body"));

// If the node is a type of assignment or if the node is a paren and nested
// inside that paren is a node that is a type of assignment.
const containsAssignment = (node) =>
  node &&
  (["assign", "massign", "opassign"].includes(node.type) ||
    (Array.isArray(node.body) && node.body.some(containsAssignment)));

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

const getTrailingComma = (opts) => ["all", "es5"].includes(opts.trailingComma);

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

const prefix = (value) => (path, opts, print) =>
  concat([value, path.call(print, "body", 0)]);

const skippable = ["array", "hash", "heredoc", "lambda", "regexp_literal"];
const skipAssignIndent = (node) =>
  skippable.includes(node.type) ||
  (node.type === "call" && skipAssignIndent(node.body[0]));

module.exports = {
  concatBody,
  containsAssignment,
  docLength,
  empty,
  first,
  getTrailingComma,
  hasAncestor,
  isEmptyStmts,
  literal,
  literalLineNoBreak,
  makeCall,
  prefix,
  skipAssignIndent
};
