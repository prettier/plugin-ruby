const { concat, group, indent, softline } = require("prettier").doc.builders;

module.exports = {
  // Adding various parts to the regexp expression (in case of interpolation)
  regexp_add: (path, options, print) => [
    ...path.call(print, "body", 0),
    path.call(print, "body", 1)
  ],
  // Parent node for regexp expressions
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
  // Start of a regexp expression
  regexp_new: (path, options, print) => [],
};
