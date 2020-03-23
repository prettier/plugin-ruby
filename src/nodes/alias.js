const { concat, join } = require("../prettier");

const usingSymbols = (path) => {
  const [left, right] = path.getValue().body.map((node) => node.body[0].type);
  return left === "symbol" && right === "symbol";
};

const identFromSymbol = (path, print, index) =>
  path.call(print, "body", index, "body", 0, "body", 0);

const aliasError = (_path, _opts, _print) => {
  throw new Error("can't make alias for the number variables");
};

const aliasVars = (path, opts, print) => {
  if (usingSymbols(path)) {
    return join(" ", [
      identFromSymbol(path, print, 0),
      identFromSymbol(path, print, 1)
    ]);
  }
  return join(" ", path.map(print, "body"));
};

const alias = (path, opts, print) =>
  concat(["alias ", aliasVars(path, opts, print)]);

module.exports = {
  alias,
  alias_error: aliasError,
  var_alias: alias
};
