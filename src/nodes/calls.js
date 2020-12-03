const { breakParent, concat, group, indent, softline } = require("../prettier");
const { concatBody, first, makeCall } = require("../utils");

const toProc = require("../toProc");

const noIndent = ["array", "hash", "if", "method_add_block", "xstring_literal"];

// A call chain is when you call a bunch of methods right in a row. They're
// pretty common on things like strings, arrays, or ActiveRecord::Relation
// objects. This algorithm could be tweaked to include certain types of
// arguments versus others, but this is a good first pass.
function isCallChain(path) {
  let parent = 0;
  let parentNode = path.getParentNode(parent);
  let callCount = 1;

  while (parentNode) {
    // We don't want to have special method handling if this method chain is
    // actually an argument to something else
    if (parentNode.type === "args") {
      return false;
    }

    // We want to get a list of all of the ancestor call nodes, so that we can
    // know if we need to provide special print handling for them.
    if (parentNode.type === "call") {
      callCount += 1;
    }

    parent += 1;
    parentNode = path.getParentNode(parent);
  }

  // We consider it a call chain if there are >= 3 call nodes in a row.
  return callCount >= 3;
}

function printCall(path, opts, print) {
  const callNode = path.getValue();
  const [receiverNode, _operatorNode, messageNode] = callNode.body;

  const receiverDoc = path.call(print, "body", 0);
  const operatorDoc = makeCall(path, opts, print);

  // You can call lambdas with a special syntax that looks like func.(*args).
  // In this case, "call" is returned for the 3rd child node.
  const messageDoc =
    messageNode === "call" ? messageNode : path.call(print, "body", 2);

  // For certain left sides of the call nodes, we want to attach directly to
  // the } or end.
  if (noIndent.includes(receiverNode.type)) {
    return concat([receiverDoc, operatorDoc, messageDoc]);
  }

  // The right side of the call node, as in everything including the operator
  // and beyond.
  const rightSideDoc = indent(concat([softline, operatorDoc, messageDoc]));

  // If this call is inside of a call chain (3 or more calls in a row), then
  // we're going to provide special handling.
  if (isCallChain(path)) {
    // Recurse up the AST and mark all of the call nodes as being a part of a
    // call chain so that when they get called to print they print themselves
    // accordingly.
    let parent = 0;
    let parentNode = path.getParentNode();

    while (parentNode) {
      if (parentNode.type === "call") {
        parentNode["callChain"] = true;
      }
      parent += 1;
      parentNode = path.getParentNode(parent);
    }

    return group(concat([breakParent, receiverDoc, rightSideDoc]));
  }

  return group(
    concat([
      receiverDoc,
      callNode["callChain"] ? rightSideDoc : group(rightSideDoc)
    ])
  );
}

module.exports = {
  call: printCall,
  fcall: concatBody,
  method_add_arg: (path, opts, print) => {
    const [method, args] = path.map(print, "body");
    const argNode = path.getValue().body[1];

    // You can end up here if you have a method with a ? ending, presumably
    // because the parser knows that it cannot be a local variable.
    if (args.length === 0) {
      return method;
    }

    // This case will ONLY be hit if we can successfully turn the block into a
    // to_proc call. In that case, we just explicitly add the parens around it.
    if (argNode.type === "args" && args.length > 0) {
      return concat([method, "("].concat(args).concat(")"));
    }

    return concat([method, args]);
  },
  method_add_block: (path, opts, print) => {
    const [method, block] = path.getValue().body;
    const proc = toProc(path, opts, block);

    if (proc && method.type === "call") {
      return group(
        concat([
          path.call(print, "body", 0),
          "(",
          indent(concat([softline, proc])),
          concat([softline, ")"])
        ])
      );
    }

    if (proc) {
      return path.call(print, "body", 0);
    }

    return concat(path.map(print, "body"));
  },
  vcall: first
};
