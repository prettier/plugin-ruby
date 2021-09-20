import type * as Prettier from "prettier";
import type { Plugin, Ruby } from "../types";

const {
  align,
  breakParent,
  concat,
  hardline,
  group,
  ifBreak,
  indent,
  softline
} = require("../../prettier");

import { containsAssignment, inlineEnsureParens, isEmptyStmts } from "../../utils";

function isConcat(doc: any): doc is Prettier.doc.builders.Concat {
  return doc.type === "concat";
}

// If the statements are just a single if/unless, in block or modifier form, or
// a ternary
function containsSingleConditional(stmts: Ruby.Stmts) {
  return (
    stmts.body.length === 1 &&
    ["if", "if_mod", "ifop", "unless", "unless_mod"].includes(stmts.body[0].type)
  );
}

function printWithAddition(keyword: string, path: Plugin.Path<Ruby.If | Ruby.Unless>, print: Plugin.Print, breaking: boolean) {
  return concat([
    `${keyword} `,
    align(keyword.length + 1, path.call(print, "body", 0)),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, path.call(print, "body", 2)]),
    concat([softline, "end"]),
    breaking ? breakParent : ""
  ]);
}

// For the unary `not` operator, we need to explicitly add parentheses to it in
// order for it to be valid from within a ternary. Otherwise if the clause of
// the ternary isn't a unary `not`, we can just pass it along.
function printTernaryClause(clause: Plugin.Doc) {
  if (isConcat(clause)) {
    const [part] = clause.parts;

    if (isConcat(part) && part.parts[0] === "not") {
      // We are inside of a statements list and the statement is a unary `not`.
      return concat(["not(", part.parts[2], ")"]);
    }

    if (clause.parts[0] === "not") {
      // We are inside a ternary condition and the clause is a unary `not`.
      return concat(["not(", clause.parts[2], ")"]);
    }
  }

  return clause;
}

// The conditions for a ternary look like `foo : bar` where `foo` represents
// the truthy clause and `bar` represents the falsy clause. In the case that the
// parent node is an `unless`, these have to flip in order.
function printTernaryClauses(keyword: string, truthyClause: Plugin.Doc, falsyClause: Plugin.Doc) {
  const parts = [
    printTernaryClause(truthyClause),
    " : ",
    printTernaryClause(falsyClause)
  ];

  return keyword === "if" ? parts : parts.reverse();
}

// Handles ternary nodes. If it does not fit on one line, then we break out into
// an if/else statement. Otherwise we remain as a ternary.
export const printTernary: Plugin.Printer<Ruby.Ternary> = (path, _opts, print) => {
  const [predicate, truthyClause, falsyClause] = path.map(print, "body");
  const ternaryClauses = printTernaryClauses("if", truthyClause, falsyClause);

  return group(
    ifBreak(
      concat([
        "if ",
        align(3, predicate),
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
function printSingle(keyword: string, modifier: boolean = false): Plugin.Printer<Ruby.If | Ruby.IfModifier | Ruby.Unless | Ruby.UnlessModifier> {
  return function printSingleWithKeyword(path, { rubyModifier }, print) {
    const [_predicateNode, statementsNode] = path.getValue().body;
    const predicateDoc = path.call(print, "body", 0);
    const statementsDoc = path.call(print, "body", 1);

    const multilineParts = [
      `${keyword} `,
      align(keyword.length + 1, predicateDoc),
      indent(concat([softline, statementsDoc])),
      softline,
      "end"
    ];

    // If we do not allow modifier form conditionals or there are comments
    // inside of the body of the conditional, then we must print in the
    // multiline form.
    if (!rubyModifier || (!modifier && (statementsNode as Ruby.If | Ruby.Unless).body[0].comments)) {
      return concat([concat(multilineParts), breakParent]);
    }

    const inline = concat(
      inlineEnsureParens(path, [
        path.call(print, "body", 1),
        ` ${keyword} `,
        path.call(print, "body", 0)
      ])
    );

    // An expression with a conditional modifier (expression if true), the
    // conditional body is parsed before the predicate expression, meaning that
    // if the parser encountered a variable declaration, it would initialize
    // that variable first before evaluating the predicate expression. That
    // parse order means the difference between a NameError or not. #591
    // https://docs.ruby-lang.org/en/2.0.0/syntax/control_expressions_rdoc.html#label-Modifier+if+and+unless
    if (modifier && containsAssignment(statementsNode)) {
      return inline;
    }

    return group(ifBreak(concat(multilineParts), inline));
  };
}

const noTernary = [
  "alias",
  "assign",
  "break",
  "command",
  "command_call",
  "heredoc",
  "if",
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
  "unless",
  "unless_mod",
  "until_mod",
  "var_alias",
  "void_stmt",
  "while_mod",
  "yield",
  "yield0",
  "zsuper"
];

// Certain expressions cannot be reduced to a ternary without adding parens
// around them. In this case we say they cannot be ternaried and default instead
// to breaking them into multiple lines.
function canTernaryStmts(stmts: Ruby.Stmts) {
  if (stmts.body.length !== 1) {
    return false;
  }

  const stmt = stmts.body[0];

  // If the user is using one of the lower precedence "and" or "or" operators,
  // then we can't use a ternary expression as it would break the flow control.
  if (stmt.type === "binary" && ["and", "or"].includes(stmt.body[1])) {
    return false;
  }

  // Check against the blocklist of statement types that are not allowed to be
  // a part of a ternary expression.
  return !noTernary.includes(stmt.type);
}

// In order for an `if` or `unless` expression to be shortened to a ternary,
// there has to be one and only one "addition" (another clause attached) which
// is of the "else" type. Both the body of the main node and the body of the
// additional node must have only one statement, and that statement list must
// pass the `canTernaryStmts` check.
function canTernary(path: Plugin.Path<Ruby.If | Ruby.Unless>) {
  const [predicate, stmts, addition] = path.getValue().body;

  return (
    !["assign", "opassign", "command_call", "command"].includes(
      predicate.type
    ) &&
    addition &&
    addition.type === "else" &&
    [stmts, addition.body[0]].every(canTernaryStmts)
  );
}

// A normalized print function for both `if` and `unless` nodes.
function printConditional(keyword: string): Plugin.Printer<Ruby.If | Ruby.Unless> {
  return (path, opts, print) => {
    if (canTernary(path)) {
      let ternaryParts = [path.call(print, "body", 0), " ? "].concat(
        printTernaryClauses(
          keyword,
          path.call(print, "body", 1),
          path.call(print, "body", 2, "body", 0)
        )
      );

      if (["binary", "call"].includes(path.getParentNode().type)) {
        ternaryParts = (["("] as Plugin.Doc[]).concat(ternaryParts).concat(")");
      }

      return group(
        ifBreak(printWithAddition(keyword, path, print, false), concat(ternaryParts))
      );
    }

    const [predicate, statements, addition] = path.getValue().body;

    // If there's an additional clause that wasn't matched earlier, we know we
    // can't go for the inline option.
    if (addition) {
      return group(printWithAddition(keyword, path, print, true));
    }

    // If the body of the conditional is empty, then we explicitly have to use the
    // block form.
    if (isEmptyStmts(statements)) {
      return concat([
        `${keyword} `,
        align(keyword.length + 1, path.call(print, "body", 0)),
        concat([hardline, "end"])
      ]);
    }

    // Two situations in which we need to use the block form:
    //
    // 1. If the predicate of the conditional contains an assignment, then we can't
    // know for sure that it doesn't impact the body of the conditional.
    //
    // 2. If the conditional contains just another conditional, then collapsing it
    // would result in double modifiers on the same line.
    if (
      containsAssignment(predicate) ||
      containsSingleConditional(statements)
    ) {
      return concat([
        `${keyword} `,
        align(keyword.length + 1, path.call(print, "body", 0)),
        indent(concat([hardline, path.call(print, "body", 1)])),
        concat([hardline, "end"])
      ]);
    }

    return printSingle(keyword)(path, opts, print);
  };
}

export const printElse: Plugin.Printer<Ruby.Else> = (path, opts, print) => {
  const stmts = path.getValue().body[0];

  return concat([
    stmts.body.length === 1 && stmts.body[0].type === "command"
      ? breakParent
      : "",
    "else",
    indent(concat([softline, path.call(print, "body", 0)]))
  ]);
};

export const printElsif: Plugin.Printer<Ruby.Elsif> = (path, opts, print) => {
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
};

export const printIf = printConditional("if");
export const printIfModifier = printSingle("if", true);
export const printUnless = printConditional("unless");
export const printUnlessModifier = printSingle("unless", true);
