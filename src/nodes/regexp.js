const { concat, group, indent, softline } = require("prettier").doc.builders;

module.exports = {
  regexp: (path, opts, print) => path.map(print, "body"),
  regexp_literal: (path, opts, print) => {
    const [contents, ending] = path.map(print, "body");
    const useBraces = contents.some(content => typeof content === "string" && content.includes("/"));

    return group(concat([
      useBraces ? "%r{" : "/",
      indent(concat([softline, ...contents])),
      softline,
      useBraces ? "}" : "/"
    ]));
  }
};
