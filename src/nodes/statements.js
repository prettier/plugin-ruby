const { concat, group, hardline, join } = require("prettier").doc.builders;

const printStatementAdd = (path, options, print) => {
  const [left, right] = path.getValue().body;
  let buffer = hardline;

  // If there was originally multiple lines of whitespace between, compress down
  // to just one line of whitespace.
  if ((right.lineno - left.lineno) > 1) {
    buffer = concat([hardline, hardline]);
  }

  // If this is the first statement of the set, no need for a buffer.
  if (left.type === "stmts_new") {
    buffer = "";
  }

  // If the only statement inside of a block is a comment, we'll hit this
  // pattern. In this case only print the left side.
  if (left.type === "stmts_add" && right.type === "void_stmt") {
    buffer = "";
  }

  // If there's a void statement at the beginning of the statement chain, it
  // causes an unnecessary newline.
  const [nestedLeftType, nestedRightType] = left.body.map(({ type }) => type);
  if (nestedLeftType === "stmts_new" && nestedRightType === "void_stmt") {
    buffer = "";
  }

  return join(buffer, path.map(print, "body"));
};

module.exports = {
  stmts_add: printStatementAdd,
  stmts_new: () => "",
  void_stmt: () => ""
};
