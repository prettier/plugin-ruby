const embed = require("./embed");
const nodes = {
  comment: require("./nodes/comment"),
  doctype: require("./nodes/doctype"),
  filter: require("./nodes/filter"),
  haml_comment: require("./nodes/hamlComment"),
  plain: require("./nodes/plain"),
  root: require("./nodes/root"),
  script: require("./nodes/script"),
  silent_script: require("./nodes/silentScript"),
  tag: require("./nodes/tag")
};

const genericPrint = (path, opts, print) => {
  const { type } = path.getValue();

  /* istanbul ignore next */
  if (!(type in nodes)) {
    throw new Error(`Unsupported node encountered: ${type}`);
  }

  return nodes[type](path, opts, print);
};

module.exports = {
  embed,
  print: genericPrint
};
