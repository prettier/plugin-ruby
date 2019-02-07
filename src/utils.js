const { concat } = require("prettier").doc.builders;

const concatBody = (path, opts, print) => concat(path.map(print, "body"));

const empty = () => "";

const first = (path, opts, print) => path.call(print, "body", 0);

const literal = value => () => value;

const makeCall = (path, opts, print) => (
  ["::", "."].includes(path.getValue().body[1]) ? "." : path.call(print, "body", 1)
);

const prefix = value => (path, opts, print) => concat([
  value,
  path.call(print, "body", 0)
]);

const skipAssignIndent = node => (
  ["array", "hash", "heredoc"].includes(node.type)
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
  empty,
  first,
  literal,
  makeCall,
  prefix,
  skipAssignIndent,
  surround
};
