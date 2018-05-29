const { concat, group, indent, softline } = require("prettier").doc.builders;

const defined = (path, options, print) => {
  const parts = [
    "defined?(",
    indent(concat([softline, path.call(print, "body", 0)])),
    concat([softline, ")"])
  ];

  const { comment } = path.getValue();
  if (comment) {
    parts.push(path.call(print, "comment"));
  }

  return group(concat(parts));
};

module.exports = {
  defined
};
