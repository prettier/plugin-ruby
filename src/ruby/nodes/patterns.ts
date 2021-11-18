import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { align, group, hardline, indent, join, line } = prettier;

const patterns = ["aryptn", "binary", "fndptn", "hshptn", "rassign"];

const printPatternArg: Plugin.Printer<Ruby.AnyNode> = (path, opts, print) => {
  // Pinning is a really special syntax in pattern matching that's not really
  // all that well supported in ripper. Here we're just going to the original
  // source to see if the variable is pinned.
  if (
    opts.originalText &&
    opts.originalText[opts.locStart(path.getValue()) - 1] === "^"
  ) {
    return ["^", path.call(print)];
  }

  return path.call(print);
};

export const printAryPtn: Plugin.Printer<Ruby.Aryptn> = (path, opts, print) => {
  const node = path.getValue();
  let argDocs: Plugin.Doc[] = [];

  if (node.reqs.length > 0) {
    argDocs = argDocs.concat(
      path.map((argPath) => printPatternArg(argPath, opts, print), "reqs")
    );
  }

  if (node.rest) {
    argDocs.push(["*", path.call(print, "rest")]);
  }

  if (node.posts.length > 0) {
    argDocs = argDocs.concat(path.map(print, "posts"));
  }

  let argDoc: Plugin.Doc = group(join([",", line], argDocs));

  // There are a couple of cases where we _must_ use brackets. They include:
  //
  // * When the number of arguments inside the array pattern is one 1, then we
  //   have to include them, otherwise it matches the whole array. Consider the
  //   difference between `in [elem]` and `in elem`.
  // * If we have a wrapping constant, then we definitely need the brackets.
  //   Consider the difference between `in Const[elem]` and `in Const elem`
  // * If we're nested inside a parent pattern, then we have to have brackets.
  //   Consider the difference between `in key: first, second` and
  //   `in key: [first, second]`.
  if (
    argDocs.length === 1 ||
    node.constant ||
    patterns.includes(path.getParentNode().type)
  ) {
    argDoc = ["[", argDoc, "]"];
  }

  if (node.constant) {
    return [path.call(print, "constant"), argDoc];
  }

  return argDoc;
};

export const printFndPtn: Plugin.Printer<Ruby.FndPtn> = (path, opts, print) => {
  const node = path.getValue();
  const docs = [
    "[",
    group(
      join(
        [",", line],
        [
          ["*", path.call(print, "left")],
          ...path.map(print, "values"),
          ["*", path.call(print, "right")]
        ]
      )
    ),
    "]"
  ];

  if (node.constant) {
    return [path.call(print, "constant"), docs];
  }

  return docs;
};

export const printHshPtn: Plugin.Printer<Ruby.Hshptn> = (path, opts, print) => {
  const node = path.getValue();
  let args: Plugin.Doc | Plugin.Doc[] = [];

  if (node.keywords.length > 0) {
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

      return parts;
    };

    args = args.concat(path.map(printPair, "keywords"));
  }

  if (node.kwrest) {
    args.push(["**", path.call(print, "kwrest")]);
  }

  args = group(join([",", line], args));

  if (node.constant) {
    args = ["[", args, "]"];
  } else if (patterns.includes(path.getParentNode().type)) {
    args = ["{ ", args, " }"];
  }

  if (node.constant) {
    return [path.call(print, "constant"), args];
  }

  return args;
};

export const printIn: Plugin.Printer<Ruby.In> = (path, opts, print) => {
  const keyword = "in ";
  const parts: Plugin.Doc[] = [
    keyword,
    align(
      keyword.length,
      path.call(
        (valuePath) => printPatternArg(valuePath, opts, print),
        "pattern"
      )
    ),
    indent([hardline, path.call(print, "stmts")])
  ];

  if (path.getValue().cons) {
    parts.push(hardline, path.call(print, "cons"));
  }

  return group(parts);
};

export const printRAssign: Plugin.Printer<Ruby.Rassign> = (path, opts, print) =>
  group([
    path.call(print, "value"),
    " ",
    path.call(print, "op"),
    group(indent([line, path.call(print, "pattern")]))
  ]);
