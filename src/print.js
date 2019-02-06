const { breakParent, concat, hardline, lineSuffix } = require("prettier").doc.builders;
const nodes = require("./nodes");

module.exports = (path, opts, print) => {
  const { type, body, comment, start } = path.getValue();

  if (type in nodes) {
    const printed = nodes[type](path, opts, print);

    if (comment) {
      if (comment.start < start) {
        return concat([
          comment.break ? breakParent : "",
          comment.body,
          hardline,
          printed
        ]);
      }

      return concat([
        printed,
        comment.break ? breakParent : "",
        lineSuffix(` ${comment.body}`)
      ]);
    }
    return printed;
  }

  if (type[0] === "@") {
    return body;
  }

  throw new Error(`Unsupported node encountered: ${type}\n${JSON.stringify(body, null, 2)}`);
};
