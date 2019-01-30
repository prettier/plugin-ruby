const { concat, join } = require("prettier").doc.builders;

const usingSymbols = path => {
  const [left, right] = path.getValue().body;

  return left.body[0].type === "symbol" && right.body[0].type === "symbol";
};

const identFromSymbol = (path, print, index) => (
  path.call(print, "body", index, "body", 0, "body", 0)
);

const alias = (path, options, print) => {
  const parts = ["alias "];

  if (usingSymbols(path)) {
    parts.push(join(" ", [identFromSymbol(path, print, 0), identFromSymbol(path, print, 1)]));
  } else {
    parts.push(join(" ", path.map(print, "body")));
  }

  const { comment } = path.getValue();
  if (comment) {
    parts.push(path.call(print, "comment"));
  }

  return concat(parts);
};

module.exports = {
  alias,
  var_alias: alias
};
