const { concat, hardline, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const printWithAddition = (keyword, path, print) => concat([
  `${keyword} `,
  path.call(print, "body", 0),
  indent(concat([softline, path.call(print, "body", 1)])),
  concat([softline, path.call(print, "body", 2)]),
  concat([softline, "end"])
]);

const printConditional = keyword => (path, print) => {
  const [_predicate, _statements, addition] = path.getValue().body;

  // If there is an else and only an else, attempt to shorten to a ternary
  if (addition && addition.type === "else") {
    const parts = [path.call(print, "body", 0), " ? "];

    const truthyValue = path.call(print, "body", 1);
    const falsyValue = path.call(print, "body", 2, "body", 0);

    if (keyword === "if") {
      parts.push(truthyValue, " : ", falsyValue);
    } else {
      parts.push(falsyValue, " : ", truthyValue);
    }

    return group(ifBreak(printWithAddition(keyword, path, print), concat(parts)));
  }

  // If there's an additional clause, we know we can't go for the inline option
  if (addition) {
    return group(printWithAddition(keyword, path, print));
  }

  // If it's short enough, favor the inline conditional
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
