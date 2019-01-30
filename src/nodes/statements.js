const { concat, group, hardline, join } = require("prettier").doc.builders;

const printStatementAdd = (path, options, print) => {
  const [left, right] = path.getValue().body;

  if (left.type === "stmts_new") {
    return path.call(print, "body", 1);
  }

  let buffer = hardline;

  // If there was originally multiple lines of whitespace between, compress down
  // to just one line of whitespace.
  if ((right.lineno - left.lineno) > 1) {
    buffer = concat([hardline, hardline]);
  }

  const [nestedLeftType, nestedRightType] = left.body.map(({ type }) => type);

  // If there's a void statement at the beginning of the statement chain, it
  // causes an unnecessary newline.
  if (nestedLeftType === "stmts_new" && nestedRightType === "void_stmt") {
    return path.call(print, "body", 1);
  }

  // If the only statement inside of a block is a comment, we'll hit this
  // pattern. In this case only print the left side.
  if (left.type === "stmts_add" && right.type === "void_stmt") {
    return path.call(print, "body", 0);
  }

  return group(join(buffer, path.map(print, "body")));
};

const printStatementVoid = (path, options, print) => "";

module.exports = {
  stmts_add: printStatementAdd,
  void_stmt: printStatementVoid
};
