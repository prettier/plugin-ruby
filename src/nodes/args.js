const {
  concat,
  group,
  ifBreak,
  indent,
  literalline,
  join,
  line,
  softline
} = require("../prettier");

const toProc = require("../toProc");
const { docLength, makeArgs } = require("../utils");

// This handles a stupidly specific case where you have heredocs as arguments in
// addition to have a block being passed. In that case we can't do anything
// fancy with the heredoc beginnings because we need to have the braces or
// do..end available for the block. The code that would hit this path looks like
// this:
//
//     my_method(<<~HEREDOC
//       Hello
//     HEREDOC
//     ) { "stuff passed to block" }
//
// I don't know why you would do this instead of having the heredoc split out
// into a variable, but since this was reported as an issue (#301) I'm going to
// explicitly handle it.
function handleHeredocAndBlockInArgParen(path, { addTrailingCommas }, print) {
  let argsNode = path.getValue().body[0];
  let argsPath = [print, "body", 0];

  if (argsNode.type === "args_add_block") {
    argsNode = argsNode.body[0];
    argsPath.push("body", 0);
  }

  // If there aren't any heredocs to be found, then we can just return null.
  if (argsNode.body.every((node) => node.type !== "heredoc")) {
    return null;
  }

  // If 2 nodes up in the tree we have a method_add_block node, then we know we
  // are passing a block and need to have special handling. Otherwise we can
  // just return null.
  if (path.getParentNode(1).type !== "method_add_block") {
    return null;
  }

  const parts = [];
  const argsLength = argsNode.body.length;

  argsNode.body.forEach((argNode, index) => {
    const isInner = index !== argsLength - 1;

    if (argNode.type === "heredoc") {
      parts.push(
        argNode.beging,
        isInner || addTrailingCommas ? "," : "",
        literalline,
        concat(path.map.apply(path, argsPath.concat("body", index, "body"))),
        argNode.ending,
        isInner ? line : ""
      );
    } else {
      parts.push(path.call.apply(path, argsPath.concat("body", index)));

      if (isInner) {
        parts.push(concat([",", line]));
      } else if (addTrailingCommas) {
        parts.push(",");
      }
    }
  });

  return group(concat(["(", indent(concat(parts)), softline, ")"]));
}

module.exports = {
  arg_paren: (path, opts, print) => {
    const argsNode = path.getValue().body[0];
    const { addTrailingCommas } = opts;

    if (argsNode === null) {
      return "";
    }

    // Here we can skip the entire rest of the method by just checking if it's
    // an args_forward node, as we're guaranteed that there are no other arg
    // nodes.
    if (argsNode.type === "args_forward") {
      return "(...)";
    }

    // If we hit a very special case where we have heredocs and are surrounded
    // by a method call that passes a block, then we handle that here.
    const printed = handleHeredocAndBlockInArgParen(path, opts, print);
    if (printed) {
      return printed;
    }

    const { args, heredocs } = makeArgs(path, opts, print, 0);
    const hasBlock = argsNode.type === "args_add_block" && argsNode.body[1];

    if (heredocs.length > 1) {
      return concat(["(", join(", ", args), ")"].concat(heredocs));
    }

    // These are the docs representing the actual arguments, without any
    // parentheses or surrounding lines yet added.
    let argsDocs = [
      join(concat([",", line]), args),
      addTrailingCommas && !hasBlock ? ifBreak(",", "") : ""
    ];

    // Here we're going to make a determination on whether or not we should put
    // a newline before the first argument. In some cases this makes the
    // appearance a little better. For example, instead of taking this input:
    //
    //     foo(arg1, arg2).bar(arg1, arg2).baz(arg1)
    //
    // and transforming it into this:
    //
    //     foo(arg1, arg2).bar(arg1, arg2).baz(
    //       arg1
    //     )
    //
    // it instead gets transformed into this:
    //
    //     foo(arg1, arg2).bar(arg1, arg2)
    //       .baz(arg1)
    //
    const maxDocLength = 15;
    const firstArgDoc = args[0];

    // prettier-ignore
    const shouldWrapLine =
      (args.reduce((sum, arg) => sum + docLength(arg), 0) > maxDocLength) ||
      (args.length == 1 && firstArgDoc.type === "group" && docLength(firstArgDoc) > maxDocLength) ||
      (firstArgDoc.type === "concat" && firstArgDoc.parts.some((part) => part.type === "group"));

    // Here we're going to get all of the docs representing the doc that's
    // inside the parentheses.
    if (shouldWrapLine) {
      argsDocs = [indent(concat([softline].concat(argsDocs))), softline];
    } else {
      argsDocs = [indent(concat(argsDocs))];
    }

    // Now here we get a doc that represents the whole grouped expression,
    // including the surrouding parentheses.
    const parenDoc = group(concat(["("].concat(argsDocs).concat(")")));

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

    const proc = blockNode && toProc(path, opts, blockNode);

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
