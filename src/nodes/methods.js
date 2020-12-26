const { concat, group, hardline, indent, line } = require("../prettier");
const { first } = require("../utils");

function printMethod(offset) {
  return function printMethodWithOffset(path, opts, print) {
    const [_name, params, body] = path.getValue().body.slice(offset);
    const declaration = ["def "];

    // In this case, we're printing a method that's defined as a singleton, so
    // we need to include the target and the operator
    if (offset > 0) {
      declaration.push(
        path.call(print, "body", 0),
        path.call(print, "body", 1)
      );
    }

    // In case there are no parens but there are arguments
    const parens =
      params.type === "params" && params.body.some((paramType) => paramType);

    declaration.push(
      path.call(print, "body", offset),
      parens ? "(" : "",
      path.call(print, "body", offset + 1),
      parens ? ")" : ""
    );

    // If the body is empty, we can replace with a ;
    const stmts = body.body[0].body;

    if (
      !body.body.slice(1).some((node) => node) &&
      stmts.length === 1 &&
      stmts[0].type === "void_stmt" &&
      !stmts[0].comments
    ) {
      return group(concat(declaration.concat(["; end"])));
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

function printSingleLineMethod(path, opts, print) {
  const [nameDoc, stmtDoc] = path.map(print, "body");

  return group(
    concat(["def ", nameDoc, " =", indent(group(concat([line, stmtDoc])))])
  );
}

module.exports = {
  access_ctrl: first,
  def: printMethod(0),
  defs: printMethod(2),
  defsl: printSingleLineMethod
};
