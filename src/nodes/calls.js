const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  softline
} = require("../prettier");
const { first, makeCall, noIndent } = require("../utils");

const toProc = require("../toProc");

const chained = ["call", "method_add_arg", "method_add_block"];

function printCall(path, opts, print) {
  const node = path.getValue();
  const [receiverNode, _operatorNode, messageNode] = node.body;

  const receiverDoc = path.call(print, "body", 0);
  const operatorDoc = makeCall(path, opts, print);

  // You can call lambdas with a special syntax that looks like func.(*args).
  // In this case, "call" is returned for the 3rd child node. We don't alter
  // call syntax so if `call` is implicit, we don't print it out.
  const messageDoc = messageNode === "call" ? "" : path.call(print, "body", 2);

  // The right side of the call node, as in everything including the operator
  // and beyond.
  const rightSideDoc = concat([
    receiverNode.comments ? hardline : softline,
    operatorDoc,
    messageDoc
  ]);

  // Get a reference to the parent node so we can check if we're inside a chain
  const parentNode = path.getParentNode();

  // If our parent node is a chained node then we're not going to group the
  // right side of the expression, as we want to have a nice multi-line layout.
  if (chained.includes(parentNode.type)) {
    parentNode.chain = (node.chain || 0) + 1;
    parentNode.breakDoc = (node.breakDoc || [receiverDoc]).concat(rightSideDoc);
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (node.chain || 0) >= 3) {
    return ifBreak(
      group(indent(concat(node.breakDoc.concat(rightSideDoc)))),
      concat([receiverDoc, group(rightSideDoc)])
    );
  }

  // For certain left sides of the call nodes, we want to attach directly to
  // the } or end.
  if (noIndent.includes(receiverNode.type)) {
    return concat([receiverDoc, operatorDoc, messageDoc]);
  }

  return group(concat([receiverDoc, group(indent(rightSideDoc))]));
}

function printMethodAddArg(path, opts, print) {
  const node = path.getValue();
  const argNode = node.body[1];

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
    parentNode.chain = (node.chain || 0) + 1;
    parentNode.breakDoc = (node.breakDoc || [methodDoc]).concat(argsDoc);
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (node.chain || 0) >= 3) {
    return ifBreak(
      group(indent(concat(node.breakDoc.concat(argsDoc)))),
      concat([methodDoc, argsDoc])
    );
  }

  return concat([methodDoc, argsDoc]);
}

function printMethodAddBlock(path, { rubyToProc }, print) {
  const node = path.getValue();

  const [callNode, blockNode] = node.body;
  const [callDoc, blockDoc] = path.map(print, "body");

  // Don't bother trying to do any kind of fancy toProc transform if the option
  // is disabled.
  if (rubyToProc) {
    const proc = toProc(path, blockNode);

    if (proc && callNode.type === "call") {
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
  }

  // Get a reference to the parent node so we can check if we're inside a chain
  const parentNode = path.getParentNode();

  // If our parent node is a chained node then we're not going to group the
  // right side of the expression, as we want to have a nice multi-line layout.
  if (chained.includes(parentNode.type)) {
    parentNode.chain = (node.chain || 0) + 1;
    parentNode.breakDoc = (node.breakDoc || [callDoc]).concat(blockDoc);
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (node.chain || 0) >= 3) {
    return ifBreak(
      group(indent(concat(node.breakDoc.concat(blockDoc)))),
      concat([callDoc, blockDoc])
    );
  }

  return concat([callDoc, blockDoc]);
}

module.exports = {
  call: printCall,
  fcall: first,
  method_add_arg: printMethodAddArg,
  method_add_block: printMethodAddBlock,
  vcall: first
};
