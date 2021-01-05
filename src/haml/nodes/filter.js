const { concat, group, hardline, indent, join } = require("../../prettier");

// https://haml.info/docs/yardoc/file.REFERENCE.html#filters
function filter(path, _opts, _print) {
  const { value } = path.getValue();

  return group(
    concat([
      ":",
      value.name,
      indent(concat([hardline, join(hardline, value.text.trim().split("\n"))]))
    ])
  );
}

module.exports = filter;
