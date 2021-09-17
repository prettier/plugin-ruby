import type { Plugin, Ruby } from "./types";

const { concat, group, hardline, indent, line } = require("../../prettier");
import { isEmptyBodyStmt } from "../../utils";

function printMethod(offset: number): Plugin.Printer<Ruby.Def | Ruby.Defs> {
  return function printMethodWithOffset(path, opts, print) {
    const node = path.getValue();
    const declaration: Plugin.Doc[] = ["def "];

    let params: Ruby.Params | Ruby.Paren;
    let bodystmt: Ruby.Bodystmt;

    if (node.type === "def") {
      params = node.body[1];
      bodystmt = node.body[2];
    } else {
      // In this case, we're printing a method that's defined as a singleton, so
      // we need to include the target and the operator
      declaration.push(
        path.call(print, "body", 0),
        path.call(print, "body", 1)
      );

      params = node.body[3];
      bodystmt = node.body[4];
    }

    // In case there are no parens but there are arguments
    const parens = params.type === "params" && params.body.some((type) => type);

    declaration.push(
      path.call(print, "body", offset),
      parens ? "(" : "",
      path.call(print, "body", offset + 1),
      parens ? ")" : ""
    );

    if (isEmptyBodyStmt(bodystmt)) {
      return group(concat(declaration.concat("; end")));
    }

    return group(
      concat([
        group(concat(declaration)),
        indent(concat([hardline, path.call(print, "body", offset + 2)])),
        group(concat([hardline, "end"]))
      ])
    );
  };
}

const printSingleLineMethod: Plugin.Printer<Ruby.Defsl> = (path, opts, print) => {
  let parensNode = path.getValue().body[1];
  let paramsDoc: Plugin.Doc = "";

  if (parensNode) {
    const paramsNode = parensNode.body[0];

    if (paramsNode.body.some((type) => type)) {
      paramsDoc = path.call(print, "body", 1);
    }
  }

  return group(
    concat([
      "def ",
      path.call(print, "body", 0),
      paramsDoc,
      " =",
      indent(group(concat([line, path.call(print, "body", 2)])))
    ])
  );
};

const printAccessControl: Plugin.Printer<Ruby.AccessCtrl> = (path, opts, print) => {
  return path.call(print, "body", 0);
};

module.exports = {
  access_ctrl: printAccessControl,
  def: printMethod(0),
  defs: printMethod(2),
  defsl: printSingleLineMethod
};
