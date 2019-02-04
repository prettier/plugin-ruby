const { concat } = require("prettier").doc.builders;
const nodes = require("./nodes");

module.exports = (path, options, print) => {
  const { type, body } = path.getValue();
  const printer = nodes[type];

  if (!(type in nodes) && type[0] === "@") {
    return body;
  }

  if (!printer) {
    throw new Error(`Unsupported node encountered: ${type}\n${JSON.stringify(body, null, 2)}`);
  }

  const printed = printer(path, options, print);

  const { comment } = path.getValue();
  if (comment) {
    return concat([printed, path.call(print, "comment")]);
  }

  return printed;
};
