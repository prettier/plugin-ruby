import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { makeCall } from "../../utils";

const { align, group, ifBreak, indent, join, line, softline } = prettier;

function throwBadDoc(doc: never): never;
function throwBadDoc(doc: Plugin.Doc) {
  throw new Error(`Unknown doc ${doc}`);
}

// Loop through the already created doc nodes and determine the overall length
// so that we can properly align the command arguments.
function docLength(doc: Plugin.Doc): number {
  if (Array.isArray(doc)) {
    return doc.reduce((sum, child) => sum + docLength(child), 0);
  }

  if (typeof doc === "string") {
    return doc.length;
  }

  switch (doc.type) {
    case "concat":
    case "fill":
      return doc.parts.reduce((sum, child) => sum + docLength(child), 0);
    case "align":
    case "group":
    case "indent":
    case "line-suffix":
      return docLength(doc.contents);
    case "if-break":
      return docLength(doc.flatContents);
    case "line":
      return doc.soft ? 0 : 1;
    case "break-parent":
    case "cursor":
    case "indent-if-break":
    case "label":
    case "line-suffix-boundary":
    case "trim":
      return 0;
    default:
      throwBadDoc(doc);
  }
}

function hasDef(node: Ruby.Command) {
  return (
    node.args.type === "args_add_block" &&
    node.args.args.type === "args" &&
    node.args.args.parts[0] &&
    ["def", "defs"].includes(node.args.args.parts[0].type)
  );
}

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
function skipArgsAlign(node: Ruby.CommandCall) {
  return ["to", "not_to", "to_not"].includes(node.message.body);
}

// If there is a ternary argument to a command and it's going to get broken
// into multiple lines, then we're going to have to use parentheses around the
// command in order to make sure operator precedence doesn't get messed up.
function hasTernaryArg(node: Ruby.Args | Ruby.ArgsAddBlock | Ruby.ArgsAddStar): boolean {
  switch (node.type) {
    case "args":
      return node.parts.some((child) => child.type === "ifop");
    case "args_add_block":
      return hasTernaryArg(node.args) || node.block?.type === "ifop";
    case "args_add_star":
      return hasTernaryArg(node.args) || node.star.type === "ifop";
  }
}

export const printCommand: Plugin.Printer<Ruby.Command> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();

  const command = path.call(print, "message");
  const joinedArgs = join([",", line], path.call(print, "args"));

  const hasTernary = hasTernaryArg(node.args);
  let breakArgs;

  if (hasTernary) {
    breakArgs = indent([softline, joinedArgs]);
  } else if (hasDef(node)) {
    breakArgs = joinedArgs;
  } else {
    breakArgs = align(docLength(command) + 1, joinedArgs);
  }

  return group(
    ifBreak(
      [
        command,
        hasTernary ? "(" : " ",
        breakArgs,
        hasTernary ? [softline, ")"] : ""
      ],
      [command, " ", joinedArgs]
    )
  );
};

export const printCommandCall: Plugin.Printer<Ruby.CommandCall> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const parts = [
    path.call(print, "receiver"),
    makeCall(path, opts, print),
    path.call(print, "message")
  ];

  if (!node.args) {
    return parts;
  }

  const argDocs = join([",", line], path.call(print, "args"));
  let breakDoc;

  if (hasTernaryArg(node.args)) {
    breakDoc = parts.concat("(", indent([softline, argDocs]), softline, ")");
    parts.push(" ");
  } else if (skipArgsAlign(node)) {
    parts.push(" ");
    breakDoc = parts.concat(argDocs);
  } else {
    parts.push(" ");
    breakDoc = parts.concat(align(docLength(parts), argDocs));
  }

  const joinedDoc = parts.concat(argDocs);

  return group(ifBreak(breakDoc, joinedDoc));
};
