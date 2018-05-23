const { concat, hardline, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const printConditional = keyword => (path, print) => {
  const [_predicate, _statements, addition] = path.getValue().body;

  if (addition) {
    return group(concat([
      `${keyword} `,
      path.call(print, "body", 0),
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, path.call(print, "body", 2)]),
      concat([hardline, "end"])
    ]));
  }

  return group(ifBreak(
    concat([
      `${keyword} `,
      path.call(print, "body", 0),
      indent(concat([softline, path.call(print, "body", 1)])),
      concat([softline, "end"])
    ]),
    concat([
      path.call(print, "body", 1),
      ` ${keyword} `,
      path.call(print, "body", 0)
    ]),
  ));
};

module.exports = {
  printIf: printConditional("if"),
  printUnless: printConditional("unless")
};
