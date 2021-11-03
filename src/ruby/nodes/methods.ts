import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { isEmptyBodyStmt } from "../../utils";

const { group, hardline, indent, line } = prettier;

export const printDef: Plugin.Printer<Ruby.Def | Ruby.Defs> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const declaration: Plugin.Doc[] = ["def "];

  // In this case, we're printing a method that's defined as a singleton, so
  // we need to include the target and the operator before the name.
  if (node.type === "defs") {
    declaration.push(path.call(print, "target"), path.call(print, "operator"));
  }

  // In case there are no parens but there are arguments
  const useParens =
    node.params.type === "params" && node.params.body.some((type) => type);

  declaration.push(
    path.call(print, "name"),
    useParens ? "(" : "",
    path.call(print, "params"),
    useParens ? ")" : ""
  );

  if (isEmptyBodyStmt(node.bodystmt)) {
    return group([...declaration, "; end"]);
  }

  return group([
    group(declaration),
    indent([hardline, path.call(print, "bodystmt")]),
    hardline,
    "end"
  ]);
};

export const printSingleLineMethod: Plugin.Printer<Ruby.Defsl> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  let paramsDoc: Plugin.Doc = "";

  // If we have any kind of parameters, we're going to print the whole
  // parentheses. If we don't, then we're just going to skip them entirely.
  if (node.paren && node.paren.cnts.body.some((type) => type)) {
    paramsDoc = path.call(print, "paren");
  }

  return group([
    "def ",
    path.call(print, "name"),
    paramsDoc,
    " =",
    indent(group([line, path.call(print, "stmt")]))
  ]);
};

export const printAccessControl: Plugin.Printer<Ruby.AccessCtrl> = (
  path,
  opts,
  print
) => path.call(print, "value");
