const { concat, hardline, join, markAsRoot } = require("../prettier");

const comment = require("./nodes/comment");
const doctype = require("./nodes/doctype");
const filter = require("./nodes/filter");
const hamlComment = require("./nodes/hamlComment");
const script = require("./nodes/script");
const silentScript = require("./nodes/silentScript");
const tag = require("./nodes/tag");

const nodes = {
  comment,
  doctype,
  filter,
  haml_comment: hamlComment,
  plain: (path, _opts, _print) => {
    const { value } = path.getValue();

    return value.text.startsWith("=") ? `\\${value.text}` : value.text;
  },
  root: (path, opts, print) =>
    markAsRoot(concat([join(hardline, path.map(print, "children")), hardline])),
  script,
  silent_script: silentScript,
  tag
};

const genericPrint = (path, opts, print) => {
  const { type } = path.getValue();

  if (!(type in nodes)) {
    throw new Error(`Unsupported node encountered: ${type}`);
  }

  return nodes[type](path, opts, print);
};

module.exports = genericPrint;
