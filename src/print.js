const {
  concat, dedent, group, hardline, indent, join, line, markAsRoot
} = require("prettier").doc.builders;

const nodes = {
  "@const": (path, print) => path.getValue().body,
  "@ident": (path, print) => path.getValue().body,
  "@tstring_content": (path, print) => concat(["'", path.getValue().body, "'"]),
  bodystmt: (path, print) => join(line, path.map(print, "body", 0)),
  class: (path, print) => {
    const parts = ["class ", path.call(print, "body", 0)];

    if (path.getValue().body[1]) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    parts.push(hardline, indent(path.call(print, "body", 2)), hardline, "end", hardline);

    return group(concat(parts));
  },
  const_ref: (path, print) => path.call(print, "body", 0),
  def: (path, print) => group(concat([
    "def ",
    path.call(print, "body", 0),
    // path.call(print, "body", 1),
    hardline,
    path.call(print, "body", 2),
    hardline,
    "end"
  ])),
  params: (path, print) => concat(path.map(print, "body")),
  program: (path, print) => markAsRoot(join(hardline, path.map(print, "body", 0))),
  string_content: (path, print) => concat(path.map(print, "body")),
  string_literal: (path, print) => concat(path.map(print, "body")),
  var_ref: (path, print) => path.call(print, "body", 0)
};

const defaultNode = (path, print) => {
  console.log(path.getValue());
  return "";
};

const genericPrint = (path, options, print) => {
  const node = path.getValue();

  if (node === null) {
    return null;
  }

  return (nodes[node.type] || defaultNode)(path, print);
};

module.exports = genericPrint;
