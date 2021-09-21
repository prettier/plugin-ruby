import type { Plugin, Ruby } from "../types";

const needsParens = [
  "args",
  "assign",
  "assoc_new",
  "binary",
  "call",
  "massign",
  "opassign"
];

// If you have a modifier statement (for instance an inline if statement or an
// inline while loop) there are times when you need to wrap the entire statement
// in parentheses. This occurs when you have something like:
//
//     foo[:foo] =
//       if bar?
//         baz
//       end
//
// Normally we would shorten this to an inline version, which would result in:
//
//     foo[:foo] = baz if bar?
//
// but this actually has different semantic meaning. The first example will
// result in a nil being inserted into the hash for the :foo key, whereas the
// second example will result in an empty hash because the if statement applies
// to the entire assignment.
//
// We can fix this in a couple of ways. We can use the then keyword, as in:
//
//     foo[:foo] = if bar? then baz end
//
// but I haven't actually seen this anywhere. We can also just leave it as is
// with the multi-line version, but for a short predicate and short value it
// looks pretty silly. The last option and the one I've selected here is to add
// parentheses on both sides of the expression, as in:
//
//     foo[:foo] = (baz if bar?)
//
// This approach maintains the nice conciseness of the inline version, while
// keeping the correct semantic meaning.
function inlineEnsureParens(
  path: Plugin.Path<Ruby.AnyNode>,
  parts: Plugin.Doc[]
) {
  if (needsParens.includes(path.getParentNode().type)) {
    return ["(", ...parts, ")"];
  }

  return parts;
}

export default inlineEnsureParens;
