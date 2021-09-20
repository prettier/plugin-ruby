import type { Plugin, Ruby } from "../types";

const {
  align,
  breakParent,
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  softline
} = require("../../prettier");

import { containsAssignment, inlineEnsureParens, isEmptyStmts } from "../../utils";

function printLoop(keyword: string, modifier: boolean): Plugin.Printer<Ruby.While | Ruby.WhileModifier | Ruby.Until | Ruby.UntilModifier> {
  return function printLoopWithOptions(path, { rubyModifier }, print) {
    const [_predicate, stmts] = path.getValue().body;

    // If the only statement inside this while loop is a void statement, then we
    // can shorten to just displaying the predicate and then a semicolon.
    if (isEmptyStmts(stmts)) {
      return group(
        concat([
          group(concat([keyword, " ", path.call(print, "body", 0)])),
          hardline,
          "end"
        ])
      );
    }

    const inlineLoop = concat(
      inlineEnsureParens(path, [
        path.call(print, "body", 1),
        ` ${keyword} `,
        path.call(print, "body", 0)
      ])
    );

    // If we're in the modifier form and we're modifying a `begin`, then this is
    // a special case where we need to explicitly use the modifier form because
    // otherwise the semantic meaning changes. This looks like:
    //
    //     begin
    //       foo
    //     end while bar
    //
    // The above is effectively a `do...while` loop (which we don't have in
    // ruby).
    if (modifier && path.getValue().body[1].type === "begin") {
      return inlineLoop;
    }

    const blockLoop = concat([
      concat([
        `${keyword} `,
        align(keyword.length + 1, path.call(print, "body", 0))
      ]),
      indent(concat([softline, path.call(print, "body", 1)])),
      concat([softline, "end"])
    ]);

    // If we're disallowing inline loops or if the predicate of the loop
    // contains an assignment (in which case we can't know for certain that that
    // assignment doesn't impact the statements inside the loop) then we can't
    // use the modifier form and we must use the block form.
    if (!rubyModifier || containsAssignment(path.getValue().body[0])) {
      return concat([breakParent, blockLoop]);
    }

    return group(ifBreak(blockLoop, inlineLoop));
  };
}

export const printFor: Plugin.Printer<Ruby.For> = (path, opts, print) => {
  const [varDoc, rangeDoc, stmtsDoc] = path.map(print, "body");
  const varsDoc =
    path.getValue().body[0].type === "mlhs" ? join(", ", varDoc) : varDoc;

  return group(
    concat([
      "for ",
      varsDoc,
      " in ",
      rangeDoc,
      indent(concat([hardline, stmtsDoc])),
      concat([hardline, "end"])
    ])
  );
};

export const printWhile = printLoop("while", false);
export const printWhileModifier = printLoop("while", true);
export const printUntil = printLoop("until", false);
export const printUntilModifer = printLoop("until", true);