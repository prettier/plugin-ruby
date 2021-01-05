const { concat, group, hardline, indent, join } = require("../../prettier");

// https://haml.info/docs/yardoc/file.REFERENCE.html#inserting_ruby
function script(path, opts, print) {
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

  if (value.escape_html && !value.preserve && value.interpolate) {
    parts.push(" ", value.text.trim().slice(1, -1));
  } else {
    parts.push(" ", value.text.trim());
  }

  if (children.length > 0) {
    parts.push(
      indent(concat([hardline, join(hardline, path.map(print, "children"))]))
    );
  }

  return group(concat(parts));
}

module.exports = script;
