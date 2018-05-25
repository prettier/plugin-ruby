const { concat, group, hardline, join } = require("prettier").doc.builders;

const printStatementAdd = (path, options, print) => {
  const [leftStatement, rightStatement] = path.getValue().body;
  let buffer = hardline;

  // If there was originally multiple lines of whitespace between, compress down
  // to just one line of whitespace.
  if ((rightStatement.lineno - leftStatement.lineno) > 1) {
    buffer = concat([hardline, hardline]);
  }

  if (leftStatement.type === "stmts_new") {
    return path.call(print, "body", 1);
  }

  // This weird pattern is if there's a void statement at the beginning of the
  // statement chain, it would otherwise cause an unnecessary newline.
  const [nestedLeftType, nestedRightType] = leftStatement.body.map(({ type }) => type);
  if (nestedLeftType === "stmts_new" && nestedRightType === "void_stmt") {
    return path.call(print, "body", 1);
  }

  return group(join(buffer, path.map(print, "body")));
};

const printStatementVoid = (path, options, print) => "";

module.exports = {
  printStatementAdd,
  printStatementVoid
};
