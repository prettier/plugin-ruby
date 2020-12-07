const { concat, group, hardline, indent, join, line } = require("../prettier");

function printPatternArg(path, opts, print) {
  // Pinning is a really special syntax in pattern matching that's not really
  // all that well supported in ripper. Here we're just going to the original
  // source to see if the variable is pinned.
  if (
    opts.originalText &&
    opts.originalText[opts.locStart(path.getValue()) - 1] === "^"
  ) {
    return concat(["^", path.call(print)]);
  }

  return path.call(print);
}

function printAryPtn(path, opts, print) {
  const [constant, preargs, splatarg, postargs] = path.getValue().body;
  let args = [];

  if (preargs) {
    args = args.concat(
      path.map((argPath) => printPatternArg(argPath, opts, print), "body", 1)
    );
  }

  if (splatarg) {
    args.push(concat(["*", path.call(print, "body", 2)]));
  }

  if (postargs) {
    args = args.concat(path.map(print, "body", 3));
  }

  args = group(join(concat([",", line]), args));

  if (
    constant ||
    ["aryptn", "binary", "hshptn"].includes(path.getParentNode().type)
  ) {
    args = concat(["[", args, "]"]);
  }

  if (constant) {
    return concat([path.call(print, "body", 0), args]);
  }

  return args;
}

function printHshPtn(path, opts, print) {
  const [constant, keyValuePairs, keyValueRest] = path.getValue().body;
  let args = [];

  if (keyValuePairs) {
    const printPair = (pairPath) => {
      const parts = [pairPath.call(print, 0)];

      if (pairPath.getValue()[1]) {
        parts.push(
          " ",
          pairPath.call(
            (pairValuePath) => printPatternArg(pairValuePath, opts, print),
            1
          )
        );
      }

      return concat(parts);
    };

    args = args.concat(path.map(printPair, "body", 1));
  }

  if (keyValueRest) {
    args.push(concat(["**", path.call(print, "body", 2)]));
  }

  args = group(join(concat([",", line]), args));

  if (constant) {
    args = concat(["[", args, "]"]);
  } else if (
    ["aryptn", "binary", "hshptn"].includes(path.getParentNode().type)
  ) {
    args = concat(["{", args, "}"]);
  }

  if (constant) {
    return concat([path.call(print, "body", 0), args]);
  }

  return args;
}

function printIn(path, opts, print) {
  const parts = [
    "in ",
    path.call(
      (valuePath) => printPatternArg(valuePath, opts, print),
      "body",
      0
    ),
    indent(concat([hardline, path.call(print, "body", 1)]))
  ];

  if (path.getValue().body[2]) {
    parts.push(hardline, path.call(print, "body", 2));
  }

  return group(concat(parts));
}

module.exports = {
  aryptn: printAryPtn,
  hshptn: printHshPtn,
  in: printIn
};
