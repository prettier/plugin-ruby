import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literal } from "../../utils";

const { group, ifBreak, indent, line, join, softline } = prettier;

// You can't skip the parentheses if you have comments or certain operators with
// lower precedence than the return keyword.
function canSkipParens(paren: Ruby.Paren) {
  const stmts = paren.body[0] as Ruby.Stmts;

  // return(
  //   # a
  //   b
  // )
  if (stmts.comments) {
    return false;
  }

  const stmt = stmts.body[0];

  // return (a or b)
  if (stmt.type === "binary" && ["and", "or"].includes(stmt.operator)) {
    return false;
  }

  // return (not a)
  if (stmt.type === "unary" && stmt.op === "not") {
    return false;
  }

  return true;
}

export const printReturn: Plugin.Printer<Ruby.Return> = (path, opts, print) => {
  const node = path.getValue();
  let parts: Plugin.Doc | Plugin.Doc[] = "";

  if (node.args.type === "args_add_block") {
    const args = node.args.body[0];
    let steps = ["args", "body", 0];

    if (args.type === "args" && args.body.length === 1 && args.body[0]) {
      // This is the first and only argument being passed to the return keyword.
      let arg = args.body[0];

      // If the body of the return contains parens, then just skip directly to
      // the content of the parens so that we can skip printing parens if we
      // don't want them.
      if (arg.type === "paren") {
        // If we can't skip over the parentheses, then we know we can just bail
        // out here and print the only argument as normal since it's a paren.
        if (!canSkipParens(arg)) {
          return ["return", path.call(print, "args")];
        }

        arg = (arg.body[0] as Ruby.Stmts).body[0];
        steps = steps.concat("body", 0, "body", 0);
      }

      // If we're returning an array literal that isn't a special array that has
      // at least 2 elements, then we want to grab the arguments so that we can
      // print them out as if they were normal return arguments.
      if (arg.type === "array" && arg.body[0]) {
        const contents = arg.body[0];

        if ((contents.type === "args" || contents.type === "args_add_star") && contents.body.length > 1) {
          steps = steps.concat("body", 0, "body", 0);
        }
      }
    }

    // We're doing this weird dance with the steps variable because it's
    // possible that you're printing an array nested under some parentheses, in
    // which case we still want to descend down that far. For example,
    // return([1, 2, 3]) should print as return 1, 2, 3.
    parts = (path as any).call(print, ...steps);
  }

  // If we didn't hit any of our special cases, then just print out the
  // arguments normally here.
  if (parts === "") {
    parts = path.call(print, "args");
  }

  const useBrackets = Array.isArray(parts) && parts.length > 1;

  // If we got the value straight out of the parens, then `parts` would only
  // be a singular doc as opposed to an array.
  const value = Array.isArray(parts) ? join([",", line], parts) : parts;

  return group([
    "return",
    ifBreak(useBrackets ? " [" : "(", " "),
    indent([softline, value]),
    softline,
    ifBreak(useBrackets ? "]" : ")", "")
  ]);
};

export const printReturn0 = literal("return");
