const { concat, group, indent, hardline, softline } = require("../prettier");
const toProc = require("../toProc");
const { concatBody, first, makeCall } = require("../utils");

const noIndent = ["array", "hash", "if", "method_add_block", "xstring_literal"];

const getHeredoc = (path, print, node) => {
  if (node.type === "heredoc") {
    const { beging, ending } = node;
    return { beging, ending, content: ["body", 0, "body"] };
  }

  if (node.type === "string_literal" && node.body[0].type === "heredoc") {
    const { beging, ending } = node.body[0];
    return { beging, ending, content: ["body", 0, "body", 0, "body"] };
  }

  return null;
};

module.exports = {
  call: (path, opts, print) => {
    const [receiverNode, _operatorNode, messageNode] = path.getValue().body;

    const printedReceiver = path.call(print, "body", 0);
    const printedOperator = makeCall(path, opts, print);

    // You can call lambdas with a special syntax that looks like func.(*args).
    // In this case, "call" is returned for the 3rd child node.
    const printedMessage =
      messageNode === "call" ? messageNode : path.call(print, "body", 2);

    // If we have a heredoc as a receiver, then we need to move the operator and
    // the message up to start of the heredoc declaration, as in:
    //
    //     <<~TEXT.strip
    //       content
    //     TEXT
    const heredoc = getHeredoc(path, print, receiverNode);
    if (heredoc) {
      return concat([
        heredoc.beging,
        printedOperator,
        printedMessage,
        hardline,
        concat(path.map.apply(path, [print].concat(heredoc.content))),
        heredoc.ending
      ]);
    }

    // For certain left sides of the call nodes, we want to attach directly to
    // the } or end.
    if (noIndent.includes(receiverNode.type)) {
      return concat([printedReceiver, printedOperator, printedMessage]);
    }

    return group(
      concat([
        printedReceiver,
        group(indent(concat([softline, printedOperator, printedMessage])))
      ])
    );
  },
  fcall: concatBody,
  method_add_arg: (path, opts, print) => {
    const [method, args] = path.map(print, "body");
    const argNode = path.getValue().body[1];

    // This case will ONLY be hit if we can successfully turn the block into a
    // to_proc call. In that case, we just explicitly add the parens around it.
    if (argNode.type === "args" && args.length > 0) {
      return concat([method, "("].concat(args).concat(")"));
    }

    return concat([method, args]);
  },
  method_add_block: (path, opts, print) => {
    const [method, block] = path.getValue().body;
    const proc = toProc(block);

    if (proc && method.type === "call") {
      return group(
        concat([
          path.call(print, "body", 0),
          "(",
          indent(concat([softline, proc])),
          concat([softline, ")"])
        ])
      );
    }

    if (proc) {
      return path.call(print, "body", 0);
    }

    return concat(path.map(print, "body"));
  },
  vcall: first
};
