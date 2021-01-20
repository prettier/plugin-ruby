const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline
} = require("../../prettier");
const { getTrailingComma } = require("../../utils");
const toProc = require("../toProc");

const noTrailingComma = ["command", "command_call"];

function getArgParenTrailingComma(node) {
  // If we have a block, then we don't want to add a trailing comma.
  if (node.type === "args_add_block" && node.body[1]) {
    return "";
  }

  // If we only have one argument and that first argument necessitates that we
  // skip putting a comma (because it would interfere with parsing the argument)
  // then we don't want to add a trailing comma.
  if (node.body.length === 1 && noTrailingComma.includes(node.body[0].type)) {
    return "";
  }

  return ifBreak(",", "");
}

function printArgParen(path, opts, print) {
  const argsNode = path.getValue().body[0];

  if (argsNode === null) {
    return "";
  }

  // Here we can skip the entire rest of the method by just checking if it's
  // an args_forward node, as we're guaranteed that there are no other arg
  // nodes.
  if (argsNode.type === "args_forward") {
    return group(
      concat([
        "(",
        indent(concat([softline, path.call(print, "body", 0)])),
        softline,
        ")"
      ])
    );
  }

  // Now here we return a doc that represents the whole grouped expression,
  // including the surrouding parentheses.
  return group(
    concat([
      "(",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.call(print, "body", 0)),
          getTrailingComma(opts) && getArgParenTrailingComma(argsNode)
        ])
      ),
      softline,
      ")"
    ])
  );
}

function printArgs(path, { rubyToProc }, print) {
  const args = path.map(print, "body");

  // Don't bother trying to do any kind of fancy toProc transform if the
  // option is disabled.
  if (rubyToProc) {
    let blockNode = null;

    // Look up the chain to see if these arguments are contained within a
    // method_add_block node, and if they are that that node has a block
    // associated with it. If it does, we're going to attempt to transform it
    // into the to_proc shorthand and add it to the list of arguments.
    [1, 2, 3].find((parent) => {
      const parentNode = path.getParentNode(parent);
      blockNode =
        parentNode &&
        parentNode.type === "method_add_block" &&
        parentNode.body[1];

      return blockNode;
    });

    const proc = blockNode && toProc(path, blockNode);

    // If we have a successful to_proc transformation, but we're part of an
    // aref node, that means it's something to the effect of
    //
    //     foo[:bar].each(&:to_s)
    //
    // In this case we need to just return regular arguments, otherwise we
    // would end up putting &:to_s inside the brackets accidentally.
    if (proc && path.getParentNode(1).type !== "aref") {
      args.push(proc);
    }
  }

  return args;
}

module.exports = {
  arg_paren: printArgParen,
  args: printArgs,
  args_add_block: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    if (path.getValue().body[1]) {
      parts.push(concat(["&", path.call(print, "body", 1)]));
    }

    return parts;
  },
  args_add_star: (path, opts, print) => {
    const printed = path.map(print, "body");
    const parts = printed[0]
      .concat([concat(["*", printed[1]])])
      .concat(printed.slice(2));

    return parts;
  },
  blockarg: (path, opts, print) => concat(["&", path.call(print, "body", 0)])
};
