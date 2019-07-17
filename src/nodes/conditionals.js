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
const printTernaryClause = clause => {
  if (clause.type === "concat") {
    const [part] = clause.parts;

    if (part.type === "concat" && part.parts[0] === "not") {
      // We are inside of a statements list and the statement is a unary `not`.
      return concat(["not(", part.parts[2], ")"]);
    }

    if (clause.parts[0] === "not") {
      // We are inside a ternary condition and the clause is a unary `not`.
      return concat(["not(", clause.parts[2], ")"]);
    }
  }

  return clause;
};

// The conditions for a ternary look like `foo : bar` where `foo` represents
// the truthy clause and `bar` represents the falsy clause. In the case that the
// parent node is an `unless`, these have to flip in order.
const printTernaryClauses = (keyword, truthyClause, falsyClause) => {
  const parts = [
    printTernaryClause(truthyClause),
    " : ",
    printTernaryClause(falsyClause)
  ];

  return keyword === "if" ? parts : parts.reverse();
};

// Handles ternary nodes. If it does not fit on one line, then we break out into
// an if/else statement. Otherwise we remain as a ternary.
const printTernary = (path, _opts, print) => {
  const [predicate, truthyClause, falsyClause] = path.map(print, "body");
  const ternaryClauses = printTernaryClauses("if", truthyClause, falsyClause);

  return group(
    ifBreak(
      concat([
        "if ",
        predicate,
        indent(concat([softline, truthyClause])),
        concat([softline, "else"]),
        indent(concat([softline, falsyClause])),
        concat([softline, "end"])
      ]),
      concat([predicate, " ? "].concat(ternaryClauses))
    )
  );
};

// Prints an `if_mod` or `unless_mod` node. Because it was previously in the
// modifier form, we're guaranteed to not have an additional node, so we can
// just work with the predicate and the body.
const printSingle = keyword => (path, { inlineConditionals }, print) => {
  const multiline = concat([
    `${keyword} `,
    align(keyword.length - 1, path.call(print, "body", 0)),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]);

  const [predicate, stmts] = path.getValue().body;
  const hasComments =
    stmts.type === "stmts" && stmts.body.some(stmt => stmt.type === "@comment");

  if (!inlineConditionals || hasComments || predicate.type === "assign") {
    return multiline;
  }

  const inline = concat([
    path.call(print, "body", 1),
    ` ${keyword} `,
    path.call(print, "body", 0)
  ]);

  return group(ifBreak(multiline, inline));
};

// Certain expressions cannot be reduced to a ternary without adding parens
// around them. In this case we say they cannot be ternaried and default instead
// to breaking them into multiple lines.
const canTernaryStmts = stmts =>
  stmts.body.length === 1 && !noTernary.includes(stmts.body[0].type);

// In order for an `if` or `unless` expression to be shortened to a ternary,
// there has to be one and only one "addition" (another clause attached) which
// is of the "else" type. Both the body of the main node and the body of the
// additional node must have only one statement, and that statement list must
// pass the `canTernaryStmts` check.
const canTernary = path => {
  const [_pred, stmts, addition] = path.getValue().body;

  return (
    addition &&
    addition.type === "else" &&
    [stmts, addition.body[0]].every(canTernaryStmts)
  );
};

// A normalized print function for both `if` and `unless` nodes.
const printConditional = keyword => (path, { inlineConditionals }, print) => {
  if (canTernary(path)) {
    let ternaryParts = [path.call(print, "body", 0), " ? "].concat(
      printTernaryClauses(
        keyword,
        path.call(print, "body", 1),
        path.call(print, "body", 2, "body", 0)
      )
    );

    if (["binary", "call"].includes(path.getParentNode().type)) {
      ternaryParts = ["("].concat(ternaryParts).concat(")");
    }

    return group(
      ifBreak(printWithAddition(keyword, path, print), concat(ternaryParts))
    );
  }

  // If there's an additional clause that wasn't matched earlier, we know we
  // can't go for the inline option.
  if (path.getValue().body[2]) {
    return group(printWithAddition(keyword, path, print, { breaking: true }));
  }

  return printSingle(keyword)(path, { inlineConditionals }, print);
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
  ifop: printTernary,
  if_mod: printSingle("if"),
  unless: printConditional("unless"),
  unless_mod: printSingle("unless")
};
