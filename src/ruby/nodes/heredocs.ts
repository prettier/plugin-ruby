import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { literallineWithoutBreakParent } from "../../utils";

const { group, lineSuffix, join } = prettier;

export const printHeredoc: Plugin.Printer<Ruby.Heredoc> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();

  // Print out each part of the heredoc to its own doc node.
  const parts = path.map((partPath) => {
    const part = partPath.getValue();

    if (part.type !== "tstring_content") {
      return print(partPath);
    }

    return join(literallineWithoutBreakParent, part.value.split(/\r?\n/));
  }, "parts");

  // We use a literalline break because matching indentation is required
  // for the heredoc contents and ending. If the line suffix contains a
  // break-parent, all ancestral groups are broken, and heredocs automatically
  // break lines in groups they appear in. We prefer them to appear in-line if
  // possible, so we use a literalline without the break-parent.
  return group([
    path.call(print, "beging"),
    lineSuffix(group([literallineWithoutBreakParent, ...parts, node.ending]))
  ]);
};
