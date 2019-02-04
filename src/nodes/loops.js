const { breakParent, concat, group, hardline, ifBreak, indent, softline } = require("prettier").doc.builders;

const printLoop = keyword => (path, { inlineLoops }, print) => group(ifBreak(
  concat([
    concat([`${keyword} `, path.call(print, "body", 0)]),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]),
  concat([
    inlineLoops ? "" : breakParent,
    path.call(print, "body", 1),
    ` ${keyword} `,
    path.call(print, "body", 0)
  ])
));

const printFor = (path, opts, print) => group(concat([
  path.call(print, "body", 1),
  ".each do |",
  path.call(print, "body", 0),
  "|",
  indent(concat([hardline, path.call(print, "body", 2)])),
  concat([hardline, "end"])
]));

module.exports = {
  while: printLoop("while"),
  while_mod: printLoop("while"),
  until: printLoop("until"),
  until_mod: printLoop("until"),
  for: printFor
};
