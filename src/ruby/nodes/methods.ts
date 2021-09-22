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

  let paramsNode: Ruby.Params | Ruby.Paren;
  let bodystmtNode: Ruby.Bodystmt;

  let nameDoc: Plugin.Doc;
  let paramsDoc: Plugin.Doc;
  let bodystmtDoc: Plugin.Doc;

  if (node.type === "def") {
    paramsNode = node.body[1];
    bodystmtNode = node.body[2];

    nameDoc = path.call(print, "body", 0);
    paramsDoc = path.call(print, "body", 1);
    bodystmtDoc = path.call(print, "body", 2);
  } else {
    // In this case, we're printing a method that's defined as a singleton, so
    // we need to include the target and the operator
    declaration.push(path.call(print, "body", 0), path.call(print, "body", 1));

    paramsNode = node.body[3];
    bodystmtNode = node.body[4];

    nameDoc = path.call(print, "body", 2);
    paramsDoc = path.call(print, "body", 3);
    bodystmtDoc = path.call(print, "body", 4);
  }

  // In case there are no parens but there are arguments
  const parens =
    paramsNode.type === "params" && paramsNode.body.some((type) => type);
  declaration.push(nameDoc, parens ? "(" : "", paramsDoc, parens ? ")" : "");

  if (isEmptyBodyStmt(bodystmtNode)) {
    return group([...declaration, "; end"]);
  }

  return group([
    group(declaration),
    indent([hardline, bodystmtDoc]),
    hardline,
    "end"
  ]);
};

export const printSingleLineMethod: Plugin.Printer<Ruby.Defsl> = (
  path,
  opts,
  print
) => {
  const parensNode = path.getValue().body[1];
  let paramsDoc: Plugin.Doc = "";

  if (parensNode) {
    const paramsNode = parensNode.body[0];

    if (paramsNode.body.some((type) => type)) {
      paramsDoc = path.call(print, "body", 1);
    }
  }

  return group([
    "def ",
    path.call(print, "body", 0),
    paramsDoc,
    " =",
    indent(group([line, path.call(print, "body", 2)]))
  ]);
};

export const printAccessControl: Plugin.Printer<Ruby.AccessCtrl> = (
  path,
  opts,
  print
) => {
  return path.call(print, "body", 0);
};
