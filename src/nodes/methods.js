const {
  align,
  concat,
  group,
  hardline,
  indent,
  join,
  line
} = require("../builders");
const { literal } = require("../utils");

const printMethod = offset => (path, opts, print) => {
  const [_name, params, body] = path.getValue().body.slice(offset);
  const declaration = ["def "];

  // In this case, we're printing a method that's defined as a singleton, so we
  // need to include the target and the operator
  if (offset > 0) {
    declaration.push(path.call(print, "body", 0), path.call(print, "body", 1));
  }

  // In case there are no parens but there are arguments
  const parens =
    params.type === "params" && params.body.some(paramType => paramType);

  declaration.push(
    path.call(print, "body", offset),
    parens ? "(" : "",
    path.call(print, "body", offset + 1),
    parens ? ")" : ""
  );

  // If the body is empty, we can replace with a ;
  const stmts = body.body[0].body;
  if (stmts.length === 1 && stmts[0].type === "void_stmt") {
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

module.exports = {
  def: printMethod(0),
  defs: printMethod(2),
  methref: (path, opts, print) => join(".:", path.map(print, "body")),
  return: (path, opts, print) => {
    const args = path.getValue().body[0].body[0];

    if (!args) {
      return "return";
    }

    if (args.body[0] && args.body[0].type === "paren") {
      // Ignoring the parens node and just going straight to the content
      return concat([
        "return ",
        path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)
      ]);
    }

    return concat(["return ", join(", ", path.call(print, "body", 0))]);
  },
  return0: literal("return"),
  super: (path, opts, print) => {
    const args = path.getValue().body[0];

    if (args.type === "arg_paren") {
      // In case there are explicitly no arguments but they are using parens,
      // we assume they are attempting to override the initializer and pass no
      // arguments up.
      if (args.body[0] === null) {
        return "super()";
      }

      return concat(["super", path.call(print, "body", 0)]);
    }

    return concat(["super ", join(", ", path.call(print, "body", 0))]);
  },
  undef: (path, opts, print) =>
    group(
      concat([
        "undef ",
        align(
          "undef ".length,
          join(concat([",", line]), path.map(print, "body", 0))
        )
      ])
    ),
  zsuper: literal("super")
};
