const { concat, group, indent, line, softline } = require("prettier").doc.builders;

const printHook = name => (path, options, print) => group(concat([
  `${name} {`,
  indent(concat([line, path.call(print, "body", 0)])),
  concat([softline, "}"])
]));

module.exports = {
  BEGIN: printHook("BEGIN"),
  END: printHook("END")
};
