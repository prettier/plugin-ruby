const { concat } = require("../prettier");

// Regexp nodes are lists that contain each segment of the regex. They either
// contain @tstring_content or string_embexpr nodes (representing plain string
// content or interpolated content). For our purposes here we'll return an array
// so that the printRegexpLiteral can just concat it into the body.
function printRegexp(path, opts, print) {
  return path.map(print, "body");
}

// This function is responsible for printing out regexp_literal nodes. They can
// either use the special %r literal syntax or they can use forward slashes. At
// the end of either of those they can have modifiers like m or x that have
// special meaning for the regex engine.
//
// We favor the use of forward slashes unless the regex contains a forward slash
// itself. In that case we switch over to using %r with braces.
function printRegexpLiteral(path, opts, print) {
  const [contents, ending] = path.map(print, "body");

  const useBraces = contents.some(
    (content) => typeof content === "string" && content.includes("/")
  );

  const parts = [useBraces ? "%r{" : "/"]
    .concat(contents)
    .concat([useBraces ? "}" : "/", ending.slice(1)]);

  return concat(parts);
}

module.exports = {
  regexp: printRegexp,
  regexp_literal: printRegexpLiteral
};
