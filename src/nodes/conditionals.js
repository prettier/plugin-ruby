const { breakParent, concat, hardline, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const printWithAddition = (keyword, path, print) => concat([
  `${keyword} `,
  path.call(print, "body", 0),
  indent(concat([softline, path.call(print, "body", 1)])),
  concat([softline, path.call(print, "body", 2)]),
  concat([softline, "end"])
]);

const printTernaryConditions = (keyword, truthyValue, falsyValue) => {
  const parts = [truthyValue, " : ", falsyValue];
  return keyword === "if" ? parts : parts.reverse();
};

const printConditional = keyword => (path, { inlineConditionals }, print) => {
  const [_predicate, statements, addition] = path.getValue().body;

  // If the addition is not an elsif or an else, then it's the second half of a
  // ternary expression
  if (addition && addition.type !== "elsif" && addition.type !== "else") {
    const parts = [path.call(print, "body", 0), " ? "];
    const truthyValue = path.call(print, "body", 1);
    const falsyValue = path.call(print, "body", 2);

    return group(ifBreak(
      concat([
        `${keyword} `,
        path.call(print, "body", 0),
        indent(concat([softline, path.call(print, "body", 1)])),
        concat([softline, "else"]),
        indent(concat([softline, path.call(print, "body", 2)])),
        concat([softline, "end"])
      ]),
      concat(parts.concat(printTernaryConditions(keyword, truthyValue, falsyValue)))
    ));
  }

  // If there is an else and only an else, attempt to shorten to a ternary
  if (addition && addition.type === "else") {
    const parts = [path.call(print, "body", 0), " ? "];
    const truthyValue = path.call(print, "body", 1);
    const falsyValue = path.call(print, "body", 2, "body", 0);

    return group(ifBreak(
      printWithAddition(keyword, path, print),
      concat([
        statements.body.every(({ type }) => ["void_stmt", "@comment"].includes(type)) ? breakParent : "",
        ...parts,
        ...printTernaryConditions(keyword, truthyValue, falsyValue)
      ])
    ));
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
      inlineConditionals ? "" : breakParent,
      path.call(print, "body", 1),
      ` ${keyword} `,
      path.call(print, "body", 0)
    ]),
  ));
};

module.exports = {
  if: printConditional("if"),
  ifop: printConditional("if"),
  if_mod: printConditional("if"),
  unless: printConditional("unless"),
  unless_mod: printConditional("unless")
};
