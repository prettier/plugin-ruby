const { concat, group, hardline, indent, join } = require("../../prettier");

// http://haml.info/docs/yardoc/file.REFERENCE.html#filters
const filter = (path, _opts, _print) => {
  const { value } = path.getValue();

  return group(
    concat([
      ":",
      value.name,
      indent(concat([hardline, join(hardline, value.text.trim().split("\n"))]))
    ])
  );
};

module.exports = filter;
