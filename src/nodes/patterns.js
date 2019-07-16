const { concat, group, hardline, indent, join, line } = require("../prettier");

module.exports = {
  aryptn: (path, opts, print) => {
    const [constant, preargs, splatarg, postargs] = path.getValue().body;
    let args = [];

    if (preargs) {
      args = args.concat(path.map(print, "body", 1));
    }

    if (splatarg) {
      args.push(concat(["*", path.call(print, "body", 2)]));
    }

    if (postargs) {
      args = args.concat(path.map(print, "body", 3));
    }

    args = group(join(concat([",", line]), args));

    if (constant || path.getParentNode().type === "binary") {
      args = concat(["[", args, "]"]);
    }

    if (constant) {
      return concat([path.call(print, "body", 0), args]);
    }

    return args;
  },
  hshptn: () => {
    throw new Error(
      "Hash pattern not currently supported (https://bugs.ruby-lang.org/issues/16008)"
    );
  },
  in: (path, opts, print) =>
    concat([
      "in ",
      path.call(print, "body", 0),
      indent(concat([hardline, path.call(print, "body", 1)]))
    ])
};
