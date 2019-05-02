const {
  align,
  breakParent,
  concat,
  hardline,
  group,
  ifBreak,
  indent,
  softline
} = require("../prettier");

const noTernary = [
  "@comment",
  "alias",
  "assign",
  "break",
  "command",
  "command_call",
  "if_mod",
  "ifop",
  "lambda",
  "massign",
  "next",
  "opassign",
  "rescue_mod",
  "return",
  "return0",
  "super",
  "undef",
  "unless_mod",
  "until_mod",
  "var_alias",
  "void_stmt",
  "while_mod",
  "yield",
  "yield0",
  "zsuper"
];

// Certain expressions cannot be shortened into a ternary within significant
// obfuscation of the code. In that case, we just default to breaking out a
// multi line if/else statement.
const canTernary = stmts =>
  stmts.body.length === 1 && !noTernary.includes(stmts.body[0].type);

const printWithAddition = (keyword, path, print, { breaking = false } = {}) =>
  concat([
    `${keyword} `,
    align(keyword.length - 1, path.call(print, "body", 0)),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, path.call(print, "body", 2)]),
    concat([softline, "end"]),
    breaking ? breakParent : ""
  ]);

// For the unary `not` operator, we need to explicitly add parentheses to it in
// order for it to be valid from within a ternary. Otherwise if the clause of
// the ternary isn't a unary `not`, we can just pass it along.
const printTernaryClauseDoc = clauseDoc => {
  if (clauseDoc.type === "concat") {
    const [clausePart] = clauseDoc.parts;

    if (clausePart.type === "concat" && clausePart.parts[0] === "not") {
      // We are inside of a statements list and the statement is a unary `not`.
      return concat(["not(", clausePart.parts[2], ")"]);
    }

    if (clauseDoc.parts[0] === "not") {
      // We are inside a ternary condition and the clause is a unary `not`.
      return concat(["not(", clauseDoc.parts[2], ")"]);
    }
  }

  return clauseDoc;
};

const printTernaryConditions = (keyword, truthyClauseDoc, falsyClauseDoc) => {
  const parts = [
    printTernaryClauseDoc(truthyClauseDoc),
    " : ",
    printTernaryClauseDoc(falsyClauseDoc)
  ];

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

    return group(
      ifBreak(
        concat([
          `${keyword} `,
          path.call(print, "body", 0),
          indent(concat([softline, path.call(print, "body", 1)])),
          concat([softline, "else"]),
          indent(concat([softline, path.call(print, "body", 2)])),
          concat([softline, "end"])
        ]),
        concat(
          parts.concat(printTernaryConditions(keyword, truthyValue, falsyValue))
        )
      )
    );
  }

  // If there is an else and only an else, attempt to shorten to a ternary
  if (
    addition &&
    addition.type === "else" &&
    canTernary(stmts) &&
    canTernary(addition.body[0])
  ) {
    const ternary = printTernaryConditions(
      keyword,
      path.call(print, "body", 1),
      path.call(print, "body", 2, "body", 0)
    );

    return group(
      ifBreak(
        printWithAddition(keyword, path, print),
        concat([path.call(print, "body", 0), " ? "].concat(ternary))
      )
    );
  }

  // If there's an additional clause, we know we can't go for the inline option
  if (addition) {
    return group(printWithAddition(keyword, path, print, { breaking: true }));
  }

  // If it's short enough, favor the inline conditional
  return group(
    ifBreak(
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
    )
  );
};

module.exports = {
  else: (path, opts, print) => {
    const stmts = path.getValue().body[0];

    return concat([
      stmts.body.length === 1 && stmts.body[0].type === "command"
        ? breakParent
        : "",
      "else",
      indent(concat([softline, path.call(print, "body", 0)]))
    ]);
  },
  elsif: (path, opts, print) => {
    const [_predicate, _statements, addition] = path.getValue().body;
    const parts = [
      group(
        concat([
          "elsif ",
          align("elsif".length - 1, path.call(print, "body", 0))
        ])
      ),
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
