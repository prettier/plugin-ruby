const { concat } = require("prettier").doc.builders;

const append = (path, opts, print) => [
  ...path.call(print, "body", 0),
  path.call(print, "body", 1)
];

const begin = start => () => [start];

const concatBody = (path, opts, print) => concat(path.map(print, "body"));

const empty = () => "";

const emptyList = () => [];

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
  ["array", "hash"].includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.body[0]))
);

const surround = (left, right) => (path, opts, print) => concat([
  left,
  path.call(print, "body", 0),
  right
]);

module.exports = {
  append,
  begin,
  concatBody,
  empty,
  emptyList,
  first,
  literal,
  makeCall,
  prefix,
  skipAssignIndent,
  surround
};
