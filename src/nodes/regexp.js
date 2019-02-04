const { concat, group, indent, softline } = require("prettier").doc.builders;
const { append, emptyList } = require("../utils");

const printRegexp = (path, opts, print) => {
  const [contents, ending] = path.map(print, "body");
  const useBraces = contents.some(content => typeof content === "string" && content.includes("/"));

  return group(concat([
    useBraces ? "%r{" : "/",
    indent(concat([softline, ...contents])),
    softline,
    useBraces ? "}" : "/"
  ]));
};

module.exports = {
  regexp_add: append,
  regexp_literal: printRegexp,
  regexp_new: emptyList
};
