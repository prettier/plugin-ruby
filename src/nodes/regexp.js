const { concat } = require("../prettier");

function shouldUseBraces(node) {
  const first = node.body[0];

  // If the first part of this regex is plain string content and we have a
  // space, then we want to use braces because otherwise we could end up with an
  // ambiguous operator, e.g. foo / bar/
  if (first && first.type === "@tstring_content" && first.body[0] === " ") {
    return true;
  }

  return node.body.some(
    (child) => child.type === "@tstring_content" && child.body.includes("/")
  );
}

// This function is responsible for printing out regexp_literal nodes. They can
// either use the special %r literal syntax or they can use forward slashes. At
// the end of either of those they can have modifiers like m or x that have
// special meaning for the regex engine.
//
// We favor the use of forward slashes unless the regex contains a forward slash
// itself. In that case we switch over to using %r with braces.
function printRegexpLiteral(path, opts, print) {
  const node = path.getValue();
  const useBraces = shouldUseBraces(node);

  const parts = [useBraces ? "%r{" : "/"]
    .concat(path.map(print, "body"))
    .concat([useBraces ? "}" : "/", node.ending.slice(1)]);

  return concat(parts);
}

module.exports = {
  regexp_literal: printRegexpLiteral
};
