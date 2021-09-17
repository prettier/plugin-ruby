import type { Plugin, Ruby } from "./types";

const { concat, group, indent, join, softline } = require("../../prettier");
const { makeCall } = require("../../utils");

const printConstPath: Plugin.Printer<Ruby.ConstPathField | Ruby.ConstPathRef> = (path, opts, print) => {
  return join("::", path.map(print, "body"));
};

const printConstRef: Plugin.Printer<Ruby.ConstRef> = (path, opts, print) => {
  return path.call(print, "body", 0);
};

const printDefined: Plugin.Printer<Ruby.Defined> = (path, opts, print) => {
  return group(
    concat([
      "defined?(",
      indent(concat([softline, path.call(print, "body", 0)])),
      concat([softline, ")"])
    ])
  );
};

const printField: Plugin.Printer<Ruby.Field> = (path, opts, print) => {
  return group(
    concat([
      path.call(print, "body", 0),
      concat([makeCall(path, opts, print), path.call(print, "body", 2)])
    ])
  );
};

const printTopConst: Plugin.Printer<Ruby.TopConstField | Ruby.TopConstRef> = (path, opts, print) => {
  return concat(["::", path.call(print, "body", 0)]);
};

module.exports = {
  const_path_field: printConstPath,
  const_path_ref: printConstPath,
  const_ref: printConstRef,
  defined: printDefined,
  field: printField,
  top_const_field: printTopConst,
  top_const_ref: printTopConst
};
