const { concat } = require("prettier").doc.builders;
const nodes = require("./nodes");

module.exports = (path, options, print) => {
  const { type, body, comment } = path.getValue();

  if (type in nodes) {
    const printed = nodes[type](path, options, print);

    if (comment) {
      return concat([printed, path.call(print, "comment")]);
    }
    return printed;
  }

  if (type[0] === "@") {
    return body;
  }

  throw new Error(`Unsupported node encountered: ${type}\n${JSON.stringify(body, null, 2)}`);
};
