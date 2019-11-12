const { concat, hardline, indent, join } = require("../../prettier");

// http://haml.info/docs/yardoc/file.REFERENCE.html#haml-comments--
const hamlComment = (path, opts, _print) => {
  const node = path.getValue();
  const parts = ["-#"];

  if (node.value.text) {
    if (opts.originalText.split("\n")[node.line - 1].trim() === "-#") {
      const lines = node.value.text.trim().split("\n");

      parts.push(indent(concat([hardline, join(hardline, lines)])));
    } else {
      parts.push(" ", node.value.text.trim());
    }
  }

  return concat(parts);
};

module.exports = hamlComment;
