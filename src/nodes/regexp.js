const { concat } = require("../prettier");
const { makeList } = require("../utils");

module.exports = {
  regexp: makeList,
  regexp_literal: (path, opts, print) => {
    const [contents, ending] = path.map(print, "body");

    const useBraces = contents.some(
      (content) => typeof content === "string" && content.includes("/")
    );
    const parts = [useBraces ? "%r{" : "/"]
      .concat(contents)
      .concat([useBraces ? "}" : "/", ending.slice(1)]);

    return concat(parts);
  }
};
