const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  line
} = require("../prettier");

function printClass(path, opts, print) {
  const [_constant, superclass, bodystmt] = path.getValue().body;
  const stmts = bodystmt.body[0];

  const parts = ["class ", path.call(print, "body", 0)];
  if (superclass) {
    parts.push(" < ", path.call(print, "body", 1));
  }

  // If the body is empty and does not contain any comments, we can just
  // replace the body with a semi-colon.
  if (
    stmts.body.length === 1 &&
    stmts.body[0].type === "void_stmt" &&
    !stmts.body[0].comments
  ) {
    return group(concat([concat(parts), ifBreak(line, "; "), "end"]));
  }

  return group(
    concat([
      concat(parts),
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ])
  );
}

function printModule(path, opts, print) {
  const declaration = group(concat(["module ", path.call(print, "body", 0)]));

  // If the body is empty, we can replace with a ;
  const stmts = path.getValue().body[1].body[0];
  if (
    stmts.body.length === 1 &&
    stmts.body[0].type === "void_stmt" &&
    !stmts.body[0].comments
  ) {
    return group(concat([declaration, ifBreak(line, "; "), "end"]));
  }

  return group(
    concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, "end"])
    ])
  );
}

function printSClass(path, opts, print) {
  return group(
    concat([
      concat(["class << ", path.call(print, "body", 0)]),
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, "end"])
    ])
  );
}

module.exports = {
  class: printClass,
  module: printModule,
  sclass: printSClass
};
