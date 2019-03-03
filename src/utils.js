const { breakParent, concat, hardline, lineSuffix } = require("prettier").doc.builders;

const concatBody = (path, opts, print) => concat(path.map(print, "body"));

const docLength = doc => {
  if (doc.length) {
    return doc.length;
  }

  if (doc.parts) {
    return doc.parts.reduce((sum, child) => sum + docLength(child), 0);
  }

  return 0;
};

const empty = () => "";

const first = (path, opts, print) => path.call(print, "body", 0);

const literal = value => () => value;

const makeCall = (path, opts, print) => {
  const operation = path.getValue().body[1];

  if ([".", "&."].includes(operation)) {
    return operation;
  }

  return operation === "::" ? "." : path.call(print, "body", 1);
};

const makeList = (path, opts, print) => path.map(print, "body");

const prefix = value => (path, opts, print) => concat([
  value,
  path.call(print, "body", 0)
]);

const printComments = (printed, start, comments) => {
  let node = printed;

  comments.forEach(comment => {
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

const skipAssignIndent = node => (
  ["array", "hash", "heredoc", "regexp_literal"].includes(node.type)
    || (node.type === "call" && skipAssignIndent(node.body[0]))
    || (node.type === "string_literal" && node.body[0].type === "heredoc")
);

const surround = (left, right) => (path, opts, print) => concat([
  left,
  path.call(print, "body", 0),
  right
]);

module.exports = {
  concatBody,
  docLength,
  empty,
  first,
  literal,
  makeCall,
  makeList,
  prefix,
  printComments,
  skipAssignIndent,
  surround
};
