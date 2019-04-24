const { printComments } = require("./utils");
const nodes = require("./nodes");

module.exports = (path, opts, print) => {
  const { type, body, comments, start } = path.getValue();

  if (type in nodes) {
    const printed = nodes[type](path, opts, print);

    if (comments) {
      return printComments(printed, start, comments);
    }
    return printed;
  }

  if (type[0] === "@") {
    return body;
  }

  throw new Error(
    `Unsupported node encountered: ${type}\n${JSON.stringify(body, null, 2)}`
  );
};
