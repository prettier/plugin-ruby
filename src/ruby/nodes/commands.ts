import type * as Prettier from "prettier";
import type { Plugin, Ruby } from "./types";

const {
  align,
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline
} = require("../../prettier");
import { makeCall } from "../../utils";

function docLength(doc: any): number {
  if (doc.length) {
    return doc.length;
  }

  if (doc.parts) {
    return (doc as Prettier.doc.builders.Concat).parts.reduce((sum, child) => sum + docLength(child), 0);
  }

  if (doc.contents) {
    return docLength(doc.contents);
  }

  return 0;
}

function hasDef(node: Ruby.Command) {
  return (
    node.body[1].type === "args_add_block" &&
    node.body[1].body[0].type === "args" &&
    node.body[1].body[0].body[0] &&
    ["def", "defs"].includes(node.body[1].body[0].body[0].type)
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
function skipArgsAlign(path: Plugin.Path<Ruby.CommandCall>) {
  return ["to", "not_to"].includes(path.getValue().body[2].body);
}

// If there is a ternary argument to a command and it's going to get broken
// into multiple lines, then we're going to have to use parentheses around the
// command in order to make sure operator precedence doesn't get messed up.
function hasTernaryArg(node: Ruby.Args | Ruby.ArgsAddBlock) {
  return (node.body[0] as any).body.some((child: Ruby.AnyNode) => child.type === "ifop");
}

export const printCommand: Plugin.Printer<Ruby.Command> = (path, opts, print) => {
  const node = path.getValue();

  const command = path.call(print, "body", 0);
  const joinedArgs = join(concat([",", line]), path.call(print, "body", 1));

  const hasTernary = hasTernaryArg(node.body[1]);
  let breakArgs;

  if (hasTernary) {
    breakArgs = indent(concat([softline, joinedArgs]));
  } else if (hasDef(node)) {
    breakArgs = joinedArgs;
  } else {
    breakArgs = align(docLength(command) + 1, joinedArgs);
  }

  return group(
    ifBreak(
      concat([
        command,
        hasTernary ? "(" : " ",
        breakArgs,
        hasTernary ? concat([softline, ")"]) : ""
      ]),
      concat([command, " ", joinedArgs])
    )
  );
};

export const printCommandCall: Plugin.Printer<Ruby.CommandCall> = (path, opts, print) => {
  const node = path.getValue();
  const parts = [
    path.call(print, "body", 0),
    makeCall(path, opts, print),
    path.call(print, "body", 2)
  ];

  if (!node.body[3]) {
    return concat(parts);
  }

  const argDocs = join(concat([",", line]), path.call(print, "body", 3));
  let breakDoc;

  if (hasTernaryArg(node.body[3])) {
    breakDoc = parts.concat(
      "(",
      indent(concat([softline, argDocs])),
      softline,
      ")"
    );
    parts.push(" ");
  } else if (skipArgsAlign(path)) {
    parts.push(" ");
    breakDoc = parts.concat(argDocs);
  } else {
    parts.push(" ");
    breakDoc = parts.concat(align(docLength(concat(parts)), argDocs));
  }

  const joinedDoc = parts.concat(argDocs);

  return group(ifBreak(concat(breakDoc), concat(joinedDoc)));
};
