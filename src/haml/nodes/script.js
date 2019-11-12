const { concat, group, hardline, indent, join } = require("../../prettier");

// http://haml.info/docs/yardoc/file.REFERENCE.html#inserting-ruby-
const script = (path, opts, print) => {
  const { children, value } = path.getValue();
  const parts = [];

  if (value.escape_html) {
    parts.unshift("&");
  }

  if (value.preserve) {
    parts.push("~");
  } else if (!value.interpolate) {
    parts.push("=");
  }

  parts.push(" ", value.text.trim());

  if (children.length > 0) {
    parts.push(
      indent(concat([hardline, join(hardline, path.map(print, "children"))]))
    );
  }

  return group(concat(parts));
};

module.exports = script;
