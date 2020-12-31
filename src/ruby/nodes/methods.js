const { concat, group, hardline, indent, line } = require("../../prettier");

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
    const parens = params.type === "params" && params.body.some((type) => type);

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
  let parensNode = path.getValue().body[1];
  let paramsDoc = "";

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
}

function printAccessControl(path, opts, print) {
  return path.call(print, "body", 0);
}

module.exports = {
  access_ctrl: printAccessControl,
  def: printMethod(0),
  defs: printMethod(2),
  defsl: printSingleLineMethod
};
