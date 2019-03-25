const { align, concat, group, ifBreak, join, line, literalline } = require("prettier").doc.builders;
const { docLength, makeCall } = require("../utils");

const makeArgs = (path, opts, print, argsIndex) => {
  let argNodes = path.getValue().body[argsIndex];
  const argPattern = [print, "body", argsIndex, "body"];

  if (argNodes.type === "args_add_block") {
    [argNodes] = argNodes.body;
    argPattern.push(0, "body");
  }

  const args = path.call(print, "body", argsIndex);
  const heredocs = [];

  argNodes.body.forEach((argNode, index) => {
    if (argNode.type === "heredoc") {
      const content = path.map.apply(path, argPattern.slice().concat([index, "body"]));
      heredocs.push(concat([literalline].concat(content).concat([argNode.ending])));

      args[index] = argNode.beging;
    }
  });

  return { args, heredocs };
};

module.exports = {
  command: (path, opts, print) => {
    const command = path.call(print, "body", 0);
    const { args, heredocs } = makeArgs(path, opts, print, 1);

    if (heredocs.length > 1) {
      return concat([command, " ", join(", ", args)].concat(heredocs));
    }

    const joinedArgs = join(concat([",", line]), args);
    const commandDoc = group(ifBreak(
      concat([command, " ", align(command.length + 1, joinedArgs)]),
      concat([command, " ", joinedArgs])
    ));

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
    const commandDoc = group(ifBreak(
      concat(parts.concat([align(docLength(concat(parts)), joinedArgs)])),
      concat(parts.concat([joinedArgs]))
    ));

    if (heredocs.length === 1) {
      return group(concat([commandDoc].concat(heredocs)));
    }

    return commandDoc;
  }
};
