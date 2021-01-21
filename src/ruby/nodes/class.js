const { concat, group, hardline, indent } = require("../../prettier");
const { isEmptyBodyStmt } = require("../../utils");

function printClass(path, opts, print) {
  const [_constant, superclass, bodystmt] = path.getValue().body;

  const parts = ["class ", path.call(print, "body", 0)];
  if (superclass) {
    parts.push(" < ", path.call(print, "body", 1));
  }

  const declaration = group(concat(parts));
  if (isEmptyBodyStmt(bodystmt)) {
    return group(concat([declaration, hardline, "end"]));
  }

  return group(
    concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ])
  );
}

function printModule(path, opts, print) {
  const node = path.getValue();
  const declaration = group(concat(["module ", path.call(print, "body", 0)]));

  if (isEmptyBodyStmt(node.body[1])) {
    return group(concat([declaration, hardline, "end"]));
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
  const bodystmt = path.getValue().body[1];
  const declaration = concat(["class << ", path.call(print, "body", 0)]);

  if (isEmptyBodyStmt(bodystmt)) {
    return group(concat([declaration, hardline, "end"]));
  }

  return group(
    concat([
      declaration,
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
