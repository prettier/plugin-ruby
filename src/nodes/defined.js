const { concat, group, indent, softline } = require("prettier").doc.builders;

const defined = (path, options, print) => group(concat([
  "defined?(",
  indent(concat([softline, path.call(print, "body", 0)])),
  concat([softline, ")"])
]));

module.exports = {
  defined
};
