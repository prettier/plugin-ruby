const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline
} = require("../prettier");

const toProc = require("../toProc");
const { makeArgs } = require("../utils");

module.exports = {
  arg_paren: (path, opts, print) => {
    if (path.getValue().body[0] === null) {
      return "";
    }

    // Here we can skip the entire rest of the method by just checking if it's
    // an args_forward node, as we're guaranteed that there are no other arg
    // nodes.
    if (path.getValue().body[0].type === "args_forward") {
      return "(...)";
    }

    const { addTrailingCommas } = opts;
    const { args, heredocs } = makeArgs(path, opts, print, 0);

    const argsNode = path.getValue().body[0];
    const hasBlock = argsNode.type === "args_add_block" && argsNode.body[1];

    if (heredocs.length > 1) {
      return concat(["(", join(", ", args), ")"].concat(heredocs));
    }

    const parenDoc = group(
      concat([
        "(",
        indent(
          concat([
            softline,
            join(concat([",", line]), args),
            addTrailingCommas && !hasBlock ? ifBreak(",", "") : ""
          ])
        ),
        concat([softline, ")"])
      ])
    );

    if (heredocs.length === 1) {
      return group(concat([parenDoc].concat(heredocs)));
    }

    return parenDoc;
  },
  args: (path, opts, print) => {
    const args = path.map(print, "body");
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

    const proc = blockNode && toProc(blockNode);

    // If we have a successful to_proc transformation, but we're part of an aref
    // node, that means it's something to the effect of
    //
    //     foo[:bar].each(&:to_s)
    //
    // In this case we need to just return regular arguments, otherwise we would
    // end up putting &:to_s inside the brackets accidentally.
    if (proc && path.getParentNode(1).type !== "aref") {
      args.push(proc);
    }

    return args;
  },
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
