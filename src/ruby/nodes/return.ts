import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, ifBreak, indent, line, join, softline } = prettier;

// You can't skip the parentheses if you have comments or certain operators with
// lower precedence than the return keyword.
function canSkipParens(paren: Ruby.Paren) {
  const stmts = paren.cnts as Ruby.Statements;

  // return(
  //   foo
  //   bar
  // )
  if (stmts.body.length !== 1) {
    return false;
  }

  // return(
  //   # a
  //   b
  // )
  if (stmts.comments) {
    return false;
  }

  const stmt = stmts.body[0];

  // return (a or b)
  if (stmt.type === "binary" && ["and", "or"].includes(stmt.op)) {
    return false;
  }

  // return (not a)
  if (stmt.type === "not") {
    return false;
  }

  return true;
}

export const printReturn: Plugin.Printer<Ruby.Return> = (path, opts, print) => {
  const node = path.getValue();
  let parts: Plugin.Doc | Plugin.Doc[] = "";
  let joining = false;

  if (node.args.type === "args_add_block") {
    const args = node.args.args;
    const steps: PropertyKey[] = ["args", "args"];

    if (args.type === "args" && args.parts.length === 1 && args.parts[0]) {
      // This is the first and only argument being passed to the return keyword.
      let arg = args.parts[0];
      steps.push("parts", 0);

      // If the body of the return contains parens, then just skip directly to
      // the content of the parens so that we can skip printing parens if we
      // don't want them.
      if (arg.type === "paren") {
        // If we can't skip over the parentheses, then we know we can just bail
        // out here and print the only argument as normal since it's a paren.
        if (!canSkipParens(arg)) {
          return ["return", path.call(print, "args")];
        }

        arg = (arg.cnts as Ruby.Statements).body[0];
        steps.push("cnts", "body", 0);
      }

      // If we're returning an array literal that isn't a special array that has
      // at least 2 elements, then we want to grab the arguments so that we can
      // print them out as if they were normal return arguments.
      if (arg.type === "array" && arg.cnts) {
        const contents = arg.cnts;

        if (contents.type === "args" && contents.parts.length > 1) {
          // If we have just regular arguments and we have more than 1.
          steps.push("cnts");
        }
      }
    }

    // We're doing this weird dance with the steps variable because it's
    // possible that you're printing an array nested under some parentheses, in
    // which case we still want to descend down that far. For example,
    // return([1, 2, 3]) should print as return 1, 2, 3.
    parts = (path as any).call((targetPath: Plugin.Path<Ruby.AnyNode>) => {
      const target = targetPath.getValue();
      joining = target.type === "args" || target.type === "args_add_block";

      return print(targetPath);
    }, ...steps);
  }

  // If we didn't hit any of our special cases, then just print out the
  // arguments normally here.
  if (parts === "") {
    parts = path.call(print, "args");
    joining = true;
  }

  const useBrackets = Array.isArray(parts) && parts.length > 1;
  const value = joining ? join([",", line], parts) : parts;

  return group([
    "return",
    ifBreak(useBrackets ? " [" : "(", " "),
    indent([softline, value]),
    softline,
    ifBreak(useBrackets ? "]" : ")", "")
  ]);
};

export const printReturn0: Plugin.Printer<Ruby.Return0> = (path) =>
  path.getValue().value;
