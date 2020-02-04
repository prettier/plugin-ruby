const { concat, group, hardline, indent, join } = require("../../prettier");

const findKeywordIndices = (children, keywords) => {
  const indices = [];

  children.forEach((child, index) => {
    if (child.type !== "silent_script") {
      return;
    }

    if (keywords.includes(child.value.keyword)) {
      indices.push(index);
    }
  });

  return indices;
};

// http://haml.info/docs/yardoc/file.REFERENCE.html#running-ruby--
const silentScript = (path, opts, print) => {
  const { children, value } = path.getValue();
  const parts = [`- ${value.text.trim()}`];

  if (children.length > 0) {
    const scripts = path.map(print, "children");

    if (value.keyword === "case") {
      const keywordIndices = findKeywordIndices(children, ["when", "else"]);

      parts.push(
        concat(
          scripts.map((script, index) => {
            const concated = concat([hardline, script]);

            return keywordIndices.includes(index) ? concated : indent(concated);
          })
        )
      );
    } else if (["if", "unless"].includes(value.keyword)) {
      const keywordIndices = findKeywordIndices(children, ["elsif", "else"]);

      parts.push(
        concat(
          scripts.map((script, index) => {
            const concated = concat([hardline, script]);

            return keywordIndices.includes(index) ? concated : indent(concated);
          })
        )
      );
    } else {
      parts.push(indent(concat([hardline, join(hardline, scripts)])));
    }
  }

  return group(concat(parts));
};

module.exports = silentScript;
