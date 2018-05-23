const { concat, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const printLoop = keyword => (path, print) => group(ifBreak(
  concat([
    concat([`${keyword} `, path.call(print, "body", 0)]),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]),
  concat([
    path.call(print, "body", 1),
    ` ${keyword} `,
    path.call(print, "body", 0)
  ])
));

module.exports = {
  printWhile: printLoop("while"),
  printUntil: printLoop("until")
};
