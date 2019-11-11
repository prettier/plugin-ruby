const { concat, group, hardline, indent, join } = require("../../prettier");

// http://haml.info/docs/yardoc/file.REFERENCE.html#running-ruby--
const silentScript = (path, opts, print) => {
  const { children, value } = path.getValue();
  const parts = [`- ${value.text.trim()}`];

  if (children.length > 0) {
    const scripts = path.map(print, "children");

    if (value.keyword === "case") {
      parts.push(join("", scripts.map((script, index) => {
        const concated = concat([hardline, script]);

        return index % 2 === 0 ? concated : indent(concated);
      })));
    } else {
      parts.push(indent(concat([
        hardline,
        join(hardline, scripts)
      ])));
    }
  }

  return group(concat(parts));
};

module.exports = silentScript;
