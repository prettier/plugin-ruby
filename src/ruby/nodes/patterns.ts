import type { Plugin, Ruby } from "../../types";

const {
  align,
  concat,
  group,
  hardline,
  indent,
  join,
  line
} = require("../../prettier");

const patterns = ["aryptn", "binary", "fndptn", "hshptn", "rassign"];

const printPatternArg: Plugin.Printer<Ruby.AnyNode> = (path, opts, print) => {
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
};

export const printAryPtn: Plugin.Printer<Ruby.Aryptn> = (path, opts, print) => {
  const [constant, preargs, splatarg, postargs] = path.getValue().body;
  let args: Plugin.Doc[] = [];

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

  if (constant || patterns.includes(path.getParentNode().type)) {
    args = concat(["[", args, "]"]);
  }

  if (constant) {
    return concat([path.call(print, "body", 0), args]);
  }

  return args;
};

export const printFndPtn: Plugin.Printer<Ruby.FndPtn> = (path, opts, print) => {
  const [constant] = path.getValue().body;

  let args = [concat(["*", path.call(print, "body", 1)])]
    .concat(path.map(print, "body", 2))
    .concat(concat(["*", path.call(print, "body", 3)]));

  args = concat(["[", group(join(concat([",", line]), args)), "]"]);

  if (constant) {
    return concat([path.call(print, "body", 0), args]);
  }

  return args;
};

export const printHshPtn: Plugin.Printer<Ruby.Hshptn> = (path, opts, print) => {
  const [constant, keyValuePairs, keyValueRest] = path.getValue().body;
  let args: Plugin.Doc[] = [];

  if (keyValuePairs.length > 0) {
    const printPair = (pairPath: Plugin.Path<[Ruby.Label, Ruby.AnyNode]>) => {
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
  } else if (patterns.includes(path.getParentNode().type)) {
    args = concat(["{ ", args, " }"]);
  }

  if (constant) {
    return concat([path.call(print, "body", 0), args]);
  }

  return args;
};

export const printIn: Plugin.Printer<Ruby.In> = (path, opts, print) => {
  const parts = [
    "in ",
    align(
      "in ".length,
      path.call(
        (valuePath) => printPatternArg(valuePath, opts, print),
        "body",
        0
      )
    ),
    indent(concat([hardline, path.call(print, "body", 1)]))
  ];

  if (path.getValue().body[2]) {
    parts.push(hardline, path.call(print, "body", 2));
  }

  return group(concat(parts));
};

export const printRAssign: Plugin.Printer<Ruby.Rassign> = (path, opts, print) => {
  const { keyword } = path.getValue();
  const [leftDoc, rightDoc] = path.map(print, "body");

  return group(
    concat([
      leftDoc,
      keyword ? " in" : " =>",
      group(indent(concat([line, rightDoc])))
    ])
  );
};
