import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { isEmptyBodyStmt, isEmptyParams } from "../../utils";

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
    declaration.push(path.call(print, "target"), path.call(print, "op"));
  }

  // In case there are no parens but there are parameters
  const useParens =
    node.params.type === "params" && !isEmptyParams(node.params);

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

export const printDefEndless: Plugin.Printer<Ruby.DefEndless> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  let paramsDoc: Plugin.Doc = "";

  // If we have any kind of parameters, we're going to print the whole
  // parentheses. If we don't, then we're just going to skip them entirely.
  if (node.paren && !isEmptyParams(node.paren.cnts)) {
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
