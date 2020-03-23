const { concat, group, indent, line } = require("../prettier");

const printHook = (name) => (path, opts, print) =>
  group(
    concat([
      `${name} {`,
      indent(concat([line, path.call(print, "body", 0)])),
      concat([line, "}"])
    ])
  );

module.exports = {
  BEGIN: printHook("BEGIN"),
  END: printHook("END")
};
