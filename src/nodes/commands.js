const { align, concat, group, ifBreak, join, line } = require("../prettier");
const { docLength, makeCall } = require("../utils");

const hasDef = (node) =>
  node.body[1].type === "args_add_block" &&
  node.body[1].body[0].type === "args" &&
  node.body[1].body[0].body[0] &&
  ["def", "defs"].includes(node.body[1].body[0].body[0].type);

// Very special handling case for rspec matchers. In general with rspec matchers
// you expect to see something like:
//
//     expect(foo).to receive(:bar).with(
//       'one',
//       'two',
//       'three',
//       'four',
//       'five'
//     )
//
// In this case the arguments are aligned to the left side as opposed to being
// aligned with the `receive` call.
const skipArgsAlign = (path) =>
  ["to", "not_to"].includes(path.getValue().body[2].body);

module.exports = {
  command: (path, opts, print) => {
    const command = path.call(print, "body", 0);

    const joinedArgs = join(concat([",", line]), path.call(print, "body", 1));
    const breakArgs = hasDef(path.getValue())
      ? joinedArgs
      : align(command.length + 1, joinedArgs);

    return group(
      ifBreak(
        concat([command, " ", breakArgs]),
        concat([command, " ", joinedArgs])
      )
    );
  },
  command_call: (path, opts, print) => {
    const parts = [
      path.call(print, "body", 0),
      makeCall(path, opts, print),
      path.call(print, "body", 2)
    ];

    if (!path.getValue().body[3]) {
      return concat(parts);
    }

    parts.push(" ");

    const joinedArgs = join(concat([",", line]), path.call(print, "body", 3));
    const breakArgs = skipArgsAlign(path)
      ? joinedArgs
      : align(docLength(concat(parts)), joinedArgs);

    return group(
      ifBreak(concat(parts.concat(breakArgs)), concat(parts.concat(joinedArgs)))
    );
  }
};
