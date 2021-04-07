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

function printNode(path, opts, print) {
  const { type } = path.getValue();

  /* istanbul ignore next */
  if (!(type in nodes)) {
    throw new Error(`Unsupported node encountered: ${type}`);
  }

  return nodes[type](path, opts, print);
}

// This function handles adding the format pragma to a source string. This is an
// optional workflow for incremental adoption.
function insertPragma(text) {
  const boundary = text.startsWith("-#") ? "\n" : "\n\n";

  return `-# @format${boundary}${text}`;
}

module.exports = {
  embed,
  print: printNode,
  insertPragma
};
