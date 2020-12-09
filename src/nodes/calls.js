const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  softline
} = require("../prettier");
const { concatBody, first, makeCall } = require("../utils");

const toProc = require("../toProc");

const chained = ["call", "method_add_arg"];
const noIndent = ["array", "hash", "if", "method_add_block", "xstring_literal"];

function printCall(path, opts, print) {
  const callNode = path.getValue();
  const [receiverNode, _operatorNode, messageNode] = callNode.body;

  const receiverDoc = path.call(print, "body", 0);
  const operatorDoc = makeCall(path, opts, print);

  // You can call lambdas with a special syntax that looks like func.(*args).
  // In this case, "call" is returned for the 3rd child node. We don't alter
  // call syntax so if `call` is implicit, we don't print it out.
  const messageDoc = messageNode === "call" ? "" : path.call(print, "body", 2);

  // For certain left sides of the call nodes, we want to attach directly to
  // the } or end.
  if (noIndent.includes(receiverNode.type)) {
    return concat([receiverDoc, operatorDoc, messageDoc]);
  }

  // The right side of the call node, as in everything including the operator
  // and beyond.
  const rightSideDoc = indent(
    concat([
      receiverNode.comments ? hardline : softline,
      operatorDoc,
      messageDoc
    ])
  );

  // Get a reference to the parent node so we can check if we're inside a chain
  const parentNode = path.getParentNode();

  // If our parent node is a chained node then we're not going to group the
  // right side of the expression, as we want to have a nice multi-line layout.
  if (chained.includes(parentNode.type)) {
    parentNode.chain = (callNode.chain || 0) + 1;
    parentNode.breakDoc = (callNode.breakDoc || [receiverDoc]).concat(
      rightSideDoc
    );
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (callNode.chain || 0) >= 3) {
    return ifBreak(
      group(concat(callNode.breakDoc.concat(rightSideDoc))),
      concat([receiverDoc, group(rightSideDoc)])
    );
  }

  return group(concat([receiverDoc, group(rightSideDoc)]));
}

function printMethodAddArg(path, opts, print) {
  const methodAddArgNode = path.getValue();
  const argNode = methodAddArgNode.body[1];

  const [methodDoc, argsDoc] = path.map(print, "body");

  // You can end up here if you have a method with a ? ending, presumably
  // because the parser knows that it cannot be a local variable.
  if (argsDoc.length === 0) {
    return methodDoc;
  }

  // This case will ONLY be hit if we can successfully turn the block into a
  // to_proc call. In that case, we just explicitly add the parens around it.
  if (argNode.type === "args" && argsDoc.length > 0) {
    return concat([methodDoc, "("].concat(argsDoc).concat(")"));
  }

  // Get a reference to the parent node so we can check if we're inside a chain
  const parentNode = path.getParentNode();

  // If our parent node is a chained node then we're not going to group the
  // right side of the expression, as we want to have a nice multi-line layout.
  if (chained.includes(parentNode.type)) {
    parentNode.chain = (methodAddArgNode.chain || 0) + 1;
    parentNode.breakDoc = (methodAddArgNode.breakDoc || [methodDoc]).concat(
      argsDoc
    );
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (
    !chained.includes(parentNode.type) &&
    (methodAddArgNode.chain || 0) >= 3
  ) {
    return ifBreak(
      group(concat(methodAddArgNode.breakDoc.concat(argsDoc))),
      concat([methodDoc, argsDoc])
    );
  }

  return concat([methodDoc, argsDoc]);
}

module.exports = {
  call: printCall,
  fcall: concatBody,
  method_add_arg: printMethodAddArg,
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
