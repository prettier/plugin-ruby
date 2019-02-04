const { concat } = require("prettier").doc.builders;

const append = (path, options, print) => [
  ...path.call(print, "body", 0),
  path.call(print, "body", 1)
];

const begin = start => () => [start];

const concatBody = (path, options, print) => concat(path.map(print, "body"));

const empty = () => [];

const first = (path, options, print) => path.call(print, "body", 0);

const literal = value => () => value;

const prefix = value => (path, options, print) => concat([
  value,
  path.call(print, "body", 0)
]);

const skipAssignIndent = node => (
  ["array", "hash"].includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.body[0]))
);

const surround = (left, right) => (path, options, print) => concat([
  left,
  path.call(print, "body", 0),
  right
]);

module.exports = {
  append,
  begin,
  concatBody,
  empty,
  first,
  literal,
  prefix,
  skipAssignIndent,
  surround
};
