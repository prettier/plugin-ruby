const { concat } = require("prettier").doc.builders;

const append = (path, options, print) => [
  ...path.call(print, "body", 0),
  path.call(print, "body", 1)
];

const begin = start => () => [start];

const concatBody = (path, options, print) => concat(path.map(print, "body"));

const literal = value => () => value;

const skipAssignIndent = node => (
  ["array", "hash"].includes(node.type) ||
    (node.type === "call" && skipAssignIndent(node.body[0]))
);

module.exports = {
  append,
  begin,
  concatBody,
  literal,
  skipAssignIndent
};
