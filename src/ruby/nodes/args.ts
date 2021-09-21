import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

import { getTrailingComma } from "../../utils";
import toProc from "../toProc";

const { group, ifBreak, indent, join, line, softline } = prettier;

const noTrailingComma = ["command", "command_call"];

function getArgParenTrailingComma(node: Ruby.Args | Ruby.ArgsAddBlock) {
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

export const printArgParen: Plugin.Printer<Ruby.ArgParen> = (
  path,
  opts,
  print
) => {
  const argsNode = path.getValue().body[0];

  if (argsNode === null) {
    return "";
  }

  // Here we can skip the entire rest of the method by just checking if it's
  // an args_forward node, as we're guaranteed that there are no other arg
  // nodes.
  if (argsNode.type === "args_forward") {
    return group([
      "(",
      indent([softline, path.call(print, "body", 0)]),
      softline,
      ")"
    ]);
  }

  // Now here we return a doc that represents the whole grouped expression,
  // including the surrouding parentheses.
  return group([
    "(",
    indent([
      softline,
      join([",", line], path.call(print, "body", 0)),
      getTrailingComma(opts) ? getArgParenTrailingComma(argsNode) : ""
    ]),
    softline,
    ")"
  ]);
};

export const printArgs: Plugin.Printer<Ruby.Args> = (
  path,
  { rubyToProc },
  print
) => {
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
};

export const printArgsAddBlock: Plugin.Printer<Ruby.ArgsAddBlock> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const blockNode = node.body[1];

  const parts = path.call(print, "body", 0) as Plugin.Doc[];

  if (blockNode) {
    let blockDoc = path.call(print, "body", 1) as any;

    if (!(blockNode.comments || []).some(({ leading }) => leading)) {
      // If we don't have any leading comments, we can just prepend the
      // operator.
      blockDoc = ["&", blockDoc];
    } else {
      // If we have a method call like:
      //
      //     foo(
      //       # comment
      //       &block
      //     )
      //
      // then we need to make sure we don't accidentally prepend the operator
      // before the comment.
      //
      // In prettier >= 2.3.0, the comments are printed as an array before the
      // content. I don't love this kind of reflection, but it's the simplest
      // way at the moment to get this right.
      blockDoc = blockDoc[0].concat(["&", blockDoc[1]], blockDoc.slice(2));
    }

    parts.push(blockDoc);
  }

  return parts;
};

export const printArgsAddStar: Plugin.Printer<Ruby.ArgsAddStar> = (
  path,
  opts,
  print
) => {
  let docs: Plugin.Doc[] = [];

  path.each((argPath, argIndex) => {
    const doc = print(argPath) as Plugin.Doc[];

    // If it's the first child, then it's an array of args, so we're going to
    // concat that onto the existing docs if there are any.
    if (argIndex === 0) {
      if (doc.length > 0) {
        docs = docs.concat(doc);
      }
      return;
    }

    // If it's after the splat, then it's an individual arg, so we're just going
    // to push it onto the array.
    if (argIndex !== 1) {
      docs.push(doc);
      return;
    }

    // If we don't have any leading comments, we can just prepend the operator.
    const argsNode = argPath.getValue() as Ruby.AnyNode;
    if (!(argsNode.comments || []).some(({ leading }) => leading)) {
      docs.push(["*", doc]);
      return;
    }

    // If we have an array like:
    //
    //     [
    //       # comment
    //       *values
    //     ]
    //
    // then we need to make sure we don't accidentally prepend the operator
    // before the comment(s).
    //
    // In prettier >= 2.3.0, the comments are printed as an array before the
    // content. I don't love this kind of reflection, but it's the simplest way
    // at the moment to get this right.
    docs.push((doc[0] as Plugin.Doc[]).concat(["*", doc[1]], doc.slice(2)));
  }, "body");

  return docs;
};

export const printBlockArg: Plugin.Printer<Ruby.Blockarg> = (
  path,
  opts,
  print
) => {
  return ["&", path.call(print, "body", 0)];
};
