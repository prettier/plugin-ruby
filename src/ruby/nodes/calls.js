const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  softline
} = require("../../prettier");
const { makeCall, noIndent } = require("../../utils");

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

  // For certain left sides of the call nodes, we want to attach directly to
  // the } or end.
  if (noIndent.includes(receiverNode.type)) {
    return concat([receiverDoc, operatorDoc, messageDoc]);
  }

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
  if (chained.includes(parentNode.type) && !node.comments) {
    parentNode.chain = (node.chain || 0) + 1;
    parentNode.callChain = (node.callChain || 0) + 1;
    parentNode.breakDoc = (node.breakDoc || [receiverDoc]).concat(rightSideDoc);
    parentNode.firstReceiverType = node.firstReceiverType || receiverNode.type;
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (node.chain || 0) >= 3) {
    return ifBreak(
      group(indent(concat(node.breakDoc.concat(rightSideDoc)))),
      concat([receiverDoc, group(rightSideDoc)])
    );
  }

  return group(concat([receiverDoc, group(indent(rightSideDoc))]));
}

function printMethodAddArg(path, opts, print) {
  const node = path.getValue();

  const [methodNode, argNode] = node.body;
  const [methodDoc, argsDoc] = path.map(print, "body");

  // You can end up here if you have a method with a ? ending, presumably
  // because the parser knows that it cannot be a local variable. You can also
  // end up here if you are explicitly using an empty set of parentheses.
  if (argsDoc.length === 0) {
    // If you're using an explicit set of parentheses on something that looks
    // like a constant, then we need to match that in order to maintain valid
    // Ruby. For example, you could do something like Foo(), on which we would
    // need to keep the parentheses to make it look like a method call.
    if (methodNode.type === "fcall" && methodNode.body[0].type === "@const") {
      return concat([methodDoc, "()"]);
    }

    // If you're using an explicit set parentheses with the special call syntax,
    // then we need to explicitly print out an extra set of parentheses. For
    // example, if you call something like Foo.new.() (implicitly calling the
    // #call method on a new instance of the Foo class), then we have to print
    // out those parentheses, otherwise we'll end up with Foo.new.
    if (methodNode.type === "call" && methodNode.body[2] === "call") {
      return concat([methodDoc, "()"]);
    }

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
  if (chained.includes(parentNode.type) && !node.comments) {
    parentNode.chain = (node.chain || 0) + 1;
    parentNode.breakDoc = (node.breakDoc || [methodDoc]).concat(argsDoc);
    parentNode.firstReceiverType = node.firstReceiverType;
  }

  // If we're at the top of a chain, then we're going to print out a nice
  // multi-line layout if this doesn't break into multiple lines.
  if (!chained.includes(parentNode.type) && (node.chain || 0) >= 3) {
    // This is pretty specialized behavior. Basically if we're at the top of a
    // chain but we've only had method calls without arguments and now we have
    // arguments, then we're effectively trying to call a method with arguments
    // that is nested under a bunch of stuff. So we group together to first part
    // to make it so just the arguments break. This looks like, for example:
    //
    //     config.action_dispatch.rescue_responses.merge!(
    //       'ActiveRecord::ConnectionTimeoutError' => :service_unavailable,
    //       'ActiveRecord::QueryCanceled' => :service_unavailable
    //     )
    //
    if (node.callChain === node.chain) {
      return concat([group(indent(concat(node.breakDoc))), group(argsDoc)]);
    }

    return ifBreak(
      group(indent(concat(node.breakDoc.concat(argsDoc)))),
      concat([methodDoc, argsDoc])
    );
  }

  return concat([methodDoc, argsDoc]);
}

function printMethodAddBlock(path, opts, print) {
  const node = path.getValue();

  const [callNode, blockNode] = node.body;
  const [callDoc, blockDoc] = path.map(print, "body");

  // Don't bother trying to do any kind of fancy toProc transform if the option
  // is disabled.
  if (opts.rubyToProc) {
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
    parentNode.firstReceiverType = node.firstReceiverType;
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

function printCallContainer(path, opts, print) {
  return path.call(print, "body", 0);
}

module.exports = {
  call: printCall,
  fcall: printCallContainer,
  method_add_arg: printMethodAddArg,
  method_add_block: printMethodAddBlock,
  vcall: printCallContainer
};
