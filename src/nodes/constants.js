const { concat, group, indent, join, softline } = require("../prettier");
const { first, makeCall, prefix } = require("../utils");

module.exports = {
  const_path_field: (path, opts, print) => join("::", path.map(print, "body")),
  const_path_ref: (path, opts, print) => join("::", path.map(print, "body")),
  const_ref: first,
  defined: (path, opts, print) =>
    group(
      concat([
        "defined?(",
        indent(concat([softline, path.call(print, "body", 0)])),
        concat([softline, ")"])
      ])
    ),
  field: (path, opts, print) =>
    group(
      concat([
        path.call(print, "body", 0),
        concat([makeCall(path, opts, print), path.call(print, "body", 2)])
      ])
    ),
  top_const_field: prefix("::"),
  top_const_ref: prefix("::")
};
