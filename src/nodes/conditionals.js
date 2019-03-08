const { align, breakParent, concat, hardline, group, ifBreak, indent, softline } = require("prettier").doc.builders;

const printWithAddition = (keyword, path, print, { breaking = false } = {}) => concat([
  `${keyword} `,
  align(keyword.length - 1, path.call(print, "body", 0)),
  indent(concat([softline, path.call(print, "body", 1)])),
  concat([softline, path.call(print, "body", 2)]),
  concat([softline, "end"]),
  breaking ? breakParent : ""
]);

const printTernaryConditions = (keyword, truthyValue, falsyValue) => {
  const parts = [truthyValue, " : ", falsyValue];
  return keyword === "if" ? parts : parts.reverse();
};

const printConditional = keyword => (path, { inlineConditionals }, print) => {
  const [_predicate, stmts, addition] = path.getValue().body;

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

    if (stmts.body.length === 1 && ["command", "command_call"].includes(stmts.body[0].type)) {
      return printWithAddition(keyword, path, print, { breaking: true });
    }

    const forceBreak = stmts.body.every(({ type }) => ["void_stmt", "@comment"].includes(type)) ? breakParent : "";
    const ternary = printTernaryConditions(keyword, truthyValue, falsyValue);

    return group(ifBreak(
      printWithAddition(keyword, path, print),
      concat([forceBreak].concat(parts).concat(ternary))
    ));
  }

  // If there's an additional clause, we know we can't go for the inline option
  if (addition) {
    return group(printWithAddition(keyword, path, print, { breaking: true }));
  }

  // If it's short enough, favor the inline conditional
  return group(ifBreak(
    concat([
      `${keyword} `,
      align(keyword.length - 1, path.call(print, "body", 0)),
      indent(concat([softline, path.call(print, "body", 1)])),
      concat([softline, "end"])
    ]),
    concat([
      inlineConditionals ? "" : breakParent,
      path.call(print, "body", 1),
      ` ${keyword} `,
      path.call(print, "body", 0)
    ])
  ));
};

module.exports = {
  elsif: (path, opts, print) => {
    const [_predicate, _statements, addition] = path.getValue().body;
    const parts = [
      group(concat(["elsif ", align("elsif".length - 1, path.call(print, "body", 0))])),
      indent(concat([hardline, path.call(print, "body", 1)]))
    ];

    if (addition) {
      parts.push(group(concat([hardline, path.call(print, "body", 2)])));
    }

    return group(concat(parts));
  },
  if: printConditional("if"),
  ifop: printConditional("if"),
  if_mod: printConditional("if"),
  unless: printConditional("unless"),
  unless_mod: printConditional("unless")
};
