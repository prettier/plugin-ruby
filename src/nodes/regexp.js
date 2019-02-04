const { concat, group, indent, softline } = require("prettier").doc.builders;
const { append, empty } = require("../utils");

module.exports = {
  regexp_add: append,
  regexp_literal: (path, options, print) => {
    const [contents, ending] = path.map(print, "body");
    const useBraces = contents.some(content => typeof content === "string" && content.includes("/"));

    return group(concat([
      useBraces ? "%r{" : "/",
      indent(concat([softline, ...contents])),
      softline,
      useBraces ? "}" : "/"
    ]));
  },
  regexp_new: empty
};
