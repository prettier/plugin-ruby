import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, indent, join, line, softline } = prettier;

export const printMAssign: Plugin.Printer<Ruby.Massign> = (
  path,
  opts,
  print
) => {
  let right = path.call(print, "body", 1);

  if (
    ["mrhs_add_star", "mrhs_new_from_args"].includes(
      path.getValue().body[1].type
    )
  ) {
    right = group(join([",", line], right));
  }

  const parts: Plugin.Doc[] = [join([",", line], path.call(print, "body", 0))];
  if ((path.getValue().body[0] as any).comma) {
    parts.push(",");
  }

  return group([group(parts), " =", indent([line, right])]);
};

export const printMLHS: Plugin.Printer<Ruby.Mlhs> = (path, opts, print) => {
  return path.map(print, "body");
};

export const printMLHSAddPost: Plugin.Printer<Ruby.MlhsAddPost> = (
  path,
  opts,
  print
) => {
  return [
    ...(path.call(print, "body", 0) as Plugin.Doc[]),
    ...(path.call(print, "body", 1) as Plugin.Doc[])
  ];
};

export const printMLHSAddStar: Plugin.Printer<Ruby.MlhsAddStar> = (
  path,
  opts,
  print
) => {
  const parts: Plugin.Doc[] = ["*"];

  if (path.getValue().body[1]) {
    parts.push(path.call(print, "body", 1));
  }

  return [...(path.call(print, "body", 0) as Plugin.Doc[]), parts];
};

export const printMLHSParen: Plugin.Printer<Ruby.MlhsParen> = (
  path,
  opts,
  print
) => {
  if (["massign", "mlhs_paren"].includes(path.getParentNode().type)) {
    // If we're nested in brackets as part of the left hand side of an
    // assignment, i.e., (a, b, c) = 1, 2, 3
    // ignore the current node and just go straight to the content
    return path.call(print, "body", 0);
  }

  const parts: Plugin.Doc[] = [
    softline,
    join([",", line], path.call(print, "body", 0))
  ];

  if ((path.getValue().body[0] as any).comma) {
    parts.push(",");
  }

  return group(["(", indent(parts), [softline, ")"]]);
};

export const printMRHS: Plugin.Printer<Ruby.Mrhs> = (path, opts, print) => {
  return path.map(print, "body");
};

export const printMRHSAddStar: Plugin.Printer<Ruby.MrhsAddStar> = (
  path,
  opts,
  print
) => {
  const [leftDoc, rightDoc] = path.map(print, "body");

  return [...(leftDoc as Plugin.Doc[]), ["*", rightDoc]];
};

export const printMRHSNewFromArgs: Plugin.Printer<Ruby.MrhsNewFromArgs> = (
  path,
  opts,
  print
) => {
  const parts = path.call(print, "body", 0) as Plugin.Doc[];

  if (path.getValue().body[1]) {
    parts.push(path.call(print, "body", 1));
  }

  return parts;
};
