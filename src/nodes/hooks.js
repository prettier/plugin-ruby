const { concat, group, indent, line } = require("../prettier");
const { isEmptyStmts } = require("../utils");

/* The `BEGIN` and `END` keywords are used to hook into the Ruby process. Any
 * `BEGIN` blocks are executed right when the process starts up, and the `END`
 * blocks are executed right before exiting.
 *
 *     BEGIN {
 *       # content goes here
 *     }
 *
 *     END {
 *       # content goes here
 *     }
 *
 * Interesting side note, you don't use `do...end` blocks with these hooks. Both
 * nodes contain one child which is a `stmts` node.
 */
function printHook(name) {
  return function printHookWithName(path, opts, print) {
    const stmtsNode = path.getValue().body[0];
    const printedStmts = path.call(print, "body", 0);

    const parts = [
      `${name} {`,
      indent(concat([line, printedStmts])),
      concat([line, "}"])
    ];

    // If there are no statements but there are comments, then we want to skip
    // printing the newline so that we don't end up with multiple spaces.
    if (isEmptyStmts(stmtsNode) && stmtsNode.comments) {
      parts[1] = indent(printedStmts);
    }

    return group(concat(parts));
  };
}

module.exports = {
  BEGIN: printHook("BEGIN"),
  END: printHook("END")
};
