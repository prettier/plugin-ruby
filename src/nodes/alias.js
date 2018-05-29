const { concat, join } = require("prettier").doc.builders;

const alias = (path, options, print) => {
  const parts = [
    "alias ",
    join(" ", path.map(print, "body"))
  ];

  const { comment } = path.getValue();
  if (comment) {
    parts.push(path.call(print, "comment"));
  }

  return concat(parts);
};

module.exports = { alias };
