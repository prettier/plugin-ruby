import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { addTrailingComment, align, group, join, line } = prettier;

const printUndefSymbol: Plugin.Printer<Ruby.DynaSymbol | Ruby.SymbolLiteral> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();

  // Since we're going to descend into the symbol literal to grab out the ident
  // node, then we need to make sure we copy over any comments as well,
  // otherwise we could accidentally skip printing them.
  if (node.comments) {
    node.comments.forEach((comment) => {
      addTrailingComment(node.body[0], comment);
    });
  }

  return path.call(print, "body", 0);
};

export const printUndef: Plugin.Printer<Ruby.Undef> = (path, opts, print) => {
  const keyword = "undef ";
  const argNodes = path.map(
    (symbolPath) => printUndefSymbol(symbolPath, opts, print),
    "body"
  );

  return group([keyword, align(keyword.length, join([",", line], argNodes))]);
};
