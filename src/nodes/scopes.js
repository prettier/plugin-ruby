const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  line
} = require("../prettier");

module.exports = {
  class: (path, opts, print) => {
    const [_constant, superclass, statements] = path.getValue().body;

    const parts = ["class ", path.call(print, "body", 0)];
    if (superclass) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    // If the body is empty, we can replace with a ;
    const stmts = statements.body[0].body;
    if (stmts.length === 1 && stmts[0].type === "void_stmt") {
      return group(concat([concat(parts), ifBreak(line, "; "), "end"]));
    }

    return group(
      concat([
        concat(parts),
        indent(concat([hardline, path.call(print, "body", 2)])),
        concat([hardline, "end"])
      ])
    );
  },
  class_name_error: (_path, _opts, _print) => {
    throw new Error("class/module name must be CONSTANT");
  },
  module: (path, opts, print) => {
    const declaration = group(concat(["module ", path.call(print, "body", 0)]));

    // If the body is empty, we can replace with a ;
    const stmts = path.getValue().body[1].body[0].body;
    if (stmts.length === 1 && stmts[0].type === "void_stmt") {
      return group(concat([declaration, ifBreak(line, "; "), "end"]));
    }

    return group(
      concat([
        declaration,
        indent(concat([hardline, path.call(print, "body", 1)])),
        concat([hardline, "end"])
      ])
    );
  },
  sclass: (path, opts, print) =>
    group(
      concat([
        concat(["class << ", path.call(print, "body", 0)]),
        indent(concat([hardline, path.call(print, "body", 1)])),
        concat([hardline, "end"])
      ])
    )
};
