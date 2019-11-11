const { concat, hardline, indent } = require("../../prettier");

// http://haml.info/docs/yardoc/file.REFERENCE.html#comments
const hamlComment = (path, opts, _print) => {
  const node = path.getValue();
  const parts = ["-#"];

  if (node.value.text) {
    if (opts.originalText.split("\n")[node.line - 1].trim() === "-#") {
      const lines = node.value.text.trim().replace("\n", "\n  ");

      parts.push(indent(concat([hardline, lines])));
    } else {
      parts.push(" ", node.value.text.trim());
    }
  }

  return concat(parts);
};

module.exports = hamlComment;
