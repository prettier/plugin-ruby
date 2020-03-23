const { align, concat, group, ifBreak, join, line } = require("../prettier");
const { docLength, makeArgs, makeCall } = require("../utils");

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
    const { args, heredocs } = makeArgs(path, opts, print, 1);

    if (heredocs.length > 1) {
      return concat([command, " ", join(", ", args)].concat(heredocs));
    }

    const joinedArgs = join(concat([",", line]), args);
    const breakArgs = hasDef(path.getValue())
      ? joinedArgs
      : align(command.length + 1, joinedArgs);

    const commandDoc = group(
      ifBreak(
        concat([command, " ", breakArgs]),
        concat([command, " ", joinedArgs])
      )
    );

    if (heredocs.length === 1) {
      return group(concat([commandDoc].concat(heredocs)));
    }

    return commandDoc;
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
    const { args, heredocs } = makeArgs(path, opts, print, 3);

    if (heredocs.length > 1) {
      return concat(parts.concat([join(", ", args)]).concat(heredocs));
    }

    const joinedArgs = join(concat([",", line]), args);
    const breakArgs = skipArgsAlign(path)
      ? joinedArgs
      : align(docLength(concat(parts)), joinedArgs);

    const commandDoc = group(
      ifBreak(concat(parts.concat(breakArgs)), concat(parts.concat(joinedArgs)))
    );

    if (heredocs.length === 1) {
      return group(concat([commandDoc].concat(heredocs)));
    }

    return commandDoc;
  }
};
