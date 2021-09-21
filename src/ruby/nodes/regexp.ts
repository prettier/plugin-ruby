import type { Plugin, Ruby } from "../../types";
import { hasAncestor } from "../../utils";

function hasContent(node: Ruby.RegexpLiteral, pattern: RegExp) {
  return node.body.some(
    (child) => child.type === "@tstring_content" && pattern.test(child.body)
  );
}

// If the first part of this regex is plain string content, we have a space
// or an =, and we're contained within a command or command_call node, then we
// want to use braces because otherwise we could end up with an ambiguous
// operator, e.g. foo / bar/ or foo /=bar/
function forwardSlashIsAmbiguous(path: Plugin.Path<Ruby.RegexpLiteral>) {
  const node = path.getValue();
  const firstChildNode = node.body[0];

  return (
    firstChildNode &&
    firstChildNode.type === "@tstring_content" &&
    [" ", "="].includes(firstChildNode.body[0]) &&
    hasAncestor(path, ["command", "command_call"])
  );
}

// This function is responsible for printing out regexp_literal nodes. They can
// either use the special %r literal syntax or they can use forward slashes. At
// the end of either of those they can have modifiers like m or x that have
// special meaning for the regex engine.
//
// We favor the use of forward slashes unless the regex contains a forward slash
// itself. In that case we switch over to using %r with braces.
export const printRegexpLiteral: Plugin.Printer<Ruby.RegexpLiteral> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const docs = path.map(print, "body");

  // We should use braces if using a forward slash would be ambiguous in the
  // current context or if there's a forward slash in the content of the regexp.
  const useBraces = forwardSlashIsAmbiguous(path) || hasContent(node, /\//);

  // If we should be using braces but we have braces in the body of the regexp,
  // then we're just going to resort to using whatever the original content was.
  if (useBraces && hasContent(node, /[{}]/)) {
    return [node.beging, ...docs, node.ending];
  }

  return [
    useBraces ? "%r{" : "/",
    ...docs,
    useBraces ? "}" : "/",
    node.ending.slice(1)
  ];
};
