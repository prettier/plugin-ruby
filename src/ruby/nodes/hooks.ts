import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, indent, line } = prettier;

// The `BEGIN` and `END` keywords are used to hook into the Ruby process. Any
// `BEGIN` blocks are executed right when the process starts up, and the `END`
// blocks are executed right before exiting.
//
//     BEGIN {
//       # content goes here
//     }
//
//     END {
//       # content goes here
//     }
//
// Interesting side note, you don't use `do...end` blocks with these hooks. Both
// nodes contain one child which is a `stmts` node.
function printHook(name: string): Plugin.Printer<Ruby.BEGIN | Ruby.END> {
  return function printHookWithName(path, opts, print) {
    return group([
      name,
      " ",
      path.call(print, "body", 0),
      indent([line, path.call(print, "body", 1)]),
      [line, "}"]
    ]);
  };
}

export const printBEGIN = printHook("BEGIN");
export const printEND = printHook("END");
