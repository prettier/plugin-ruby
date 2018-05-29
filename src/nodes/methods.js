const { concat, group, hardline, indent } = require("prettier").doc.builders;

const printMethod = offset => (path, options, print) => {
  const [name, params, body] = path.getValue().body.slice(offset);

  const printedParams = path.call(print, "body", offset + 1);
  const buffer = params.type === "params" && printedParams.parts.length > 0 ? " " : "";

  const declaration = ["def "];

  // In this case, we're printing a method that's defined as a singleton, so we
  // need to include the target and the operator
  if (offset > 0) {
    declaration.push(path.call(print, "body", 0), path.call(print, "body", 1));
  }

  declaration.push(
    path.call(print, "body", offset),
    buffer,
    printedParams
  );

  if (body.body[0].body[1].type === "void_stmt") {
    return group(concat([...declaration, "; end"]));
  }

  return group(concat([
    group(concat(declaration)),
    indent(concat([hardline, path.call(print, "body", offset + 2)])),
    group(concat([hardline, "end"]))
  ]));
};

module.exports = {
  def: printMethod(0),
  defs: printMethod(2)
};
