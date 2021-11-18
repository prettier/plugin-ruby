import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import {
  containsAssignment,
  inlineEnsureParens,
  isEmptyStmts
} from "../../utils";

const { align, breakParent, group, hardline, ifBreak, indent, join, softline } =
  prettier;

type Loop = Ruby.While | Ruby.WhileModifier | Ruby.Until | Ruby.UntilModifier;

function isModifier(
  node: Loop
): node is Ruby.WhileModifier | Ruby.UntilModifier {
  return node.type === "while_mod" || node.type === "until_mod";
}

function printLoop(keyword: string): Plugin.Printer<Loop> {
  return function printLoopWithOptions(path, { rubyModifier }, print) {
    const node = path.getValue();
    const predicateDoc = path.call(print, "pred");

    // If the only statement inside this while loop is a void statement, then we
    // can shorten to just displaying the predicate and then a semicolon.
    if (!isModifier(node) && isEmptyStmts(node.stmts)) {
      return group([group([keyword, " ", predicateDoc]), hardline, "end"]);
    }

    const statementDoc = path.call(print, isModifier(node) ? "stmt" : "stmts");
    const inlineLoop = inlineEnsureParens(path, [
      statementDoc,
      ` ${keyword} `,
      predicateDoc
    ]);

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
    if (isModifier(node) && node.stmt.type === "begin") {
      return inlineLoop;
    }

    const blockLoop = [
      [`${keyword} `, align(keyword.length + 1, predicateDoc)],
      indent([softline, statementDoc]),
      softline,
      "end"
    ];

    // If we're disallowing inline loops or if the predicate of the loop
    // contains an assignment (in which case we can't know for certain that that
    // assignment doesn't impact the statements inside the loop) then we can't
    // use the modifier form and we must use the block form.
    if (!rubyModifier || containsAssignment(node.pred)) {
      return [breakParent, blockLoop];
    }

    return group(ifBreak(blockLoop, inlineLoop));
  };
}

export const printFor: Plugin.Printer<Ruby.For> = (path, opts, print) => {
  const node = path.getValue();

  let indexDoc = path.call(print, "index");
  if (node.index.type === "mlhs") {
    indexDoc = join(", ", indexDoc);
  }

  return group([
    "for ",
    indexDoc,
    " in ",
    path.call(print, "collection"),
    indent([hardline, path.call(print, "stmts")]),
    hardline,
    "end"
  ]);
};

export const printWhile = printLoop("while");
export const printUntil = printLoop("until");
