const { concat, hardline, join } = require("../../prettier");

// The root node in the AST
function root(path, _opts, print) {
  return concat([join(hardline, path.map(print, "children")), hardline]);
}

module.exports = root;
