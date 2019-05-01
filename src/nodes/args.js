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

    [1, 2, 3].find(parent => {
      const parentNode = path.getParentNode(parent);
      blockNode =
        parentNode &&
        parentNode.type === "method_add_block" &&
        parentNode.body[1];
      return blockNode;
    });

    const proc = blockNode && toProc(blockNode);
    if (proc) {
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
