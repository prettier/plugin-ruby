const { concat, group, indent, join, softline } = require("../../prettier");
const { makeCall } = require("../../utils");

function printConstPath(path, opts, print) {
  return join("::", path.map(print, "body"));
}

function printConstRef(path, opts, print) {
  return path.call(print, "body", 0);
}

function printDefined(path, opts, print) {
  return group(
    concat([
      "defined?(",
      indent(concat([softline, path.call(print, "body", 0)])),
      concat([softline, ")"])
    ])
  );
}

function printField(path, opts, print) {
  return group(
    concat([
      path.call(print, "body", 0),
      concat([makeCall(path, opts, print), path.call(print, "body", 2)])
    ])
  );
}

function printTopConst(path, opts, print) {
  return concat(["::", path.call(print, "body", 0)]);
}

module.exports = {
  const_path_field: printConstPath,
  const_path_ref: printConstPath,
  const_ref: printConstRef,
  defined: printDefined,
  field: printField,
  top_const_field: printTopConst,
  top_const_ref: printTopConst
};
