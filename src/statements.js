const { concat, group, hardline, join } = require("prettier").doc.builders;

const lineNoFrom = node => {
  if (node === null) {
    return null;
  }

  if (node.lineno) {
    return node.lineno;
  }

  if (node.body) {
    for (let idx = node.body.length - 1; idx >= 0; idx -= 1) {
      const child = lineNoFrom(node.body[idx]);

      if (child) {
        return child;
      }
    }
  }

  return null;
};

const printStatementAdd = (path, options, print) => {
  const [leftStatement, rightStatement] = path.getValue().body;
  const leftLineNo = lineNoFrom(leftStatement);

  let buffer = hardline;
  if (leftLineNo) {
    const rightLineNo = lineNoFrom(rightStatement);

    if ((rightLineNo - leftLineNo) > 1) {
      buffer = concat([hardline, hardline]);
    }
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
