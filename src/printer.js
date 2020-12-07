const { concat, trim } = require("./prettier");

const comments = require("./comments");
const embed = require("./embed");
const nodes = require("./nodes");

// This is the generic node print function, used to convert any node in the AST
// into its equivalent Doc representation.
function printNode(path, opts, print) {
  const { type, body } = path.getValue();

  if (type in nodes) {
    return nodes[type](path, opts, print);
  }

  if (type[0] === "@") {
    return body;
  }

  const ast = JSON.stringify(body, null, 2);
  throw new Error(`Unsupported node encountered: ${type}\n${ast}`);
}

const noComments = [
  "args",
  "args_add_block",
  "args_add_star",
  "mlhs",
  "mlhs_add_post",
  "mlhs_add_star"
];

// Certain nodes are used more for organizational purposed than for actually
// displaying content, so we tell prettier that we don't want comments attached
// to them.
function canAttachComment(node) {
  return !noComments.includes(node.type);
}

// This function tells prettier how to recurse down our AST so that it can find
// where it needs to attach the comments.
function getCommentChildNodes(node) {
  return node.body;
}

// This is the generic print function for any comment in the AST. It handles
// both regular comments that begin with a # and embdoc comments, which are
// surrounded by =begin..=end.
function printComment(path, _opts) {
  const comment = path.getValue();

  if (comment.type === "@comment") {
    return `#${comment.value}`;
  }

  return concat([trim, comment.value]);
}

// To be honest I'm not 100% sure this function is actually necessary, but it
// *feels* like a block comment equivalent in JavaScript so I'm going to leave
// it in place for now.
function isBlockComment(comment) {
  return comment.type === "@embdoc";
}

module.exports = {
  embed,
  print: printNode,
  handleComments: comments,
  canAttachComment,
  getCommentChildNodes,
  printComment,
  isBlockComment
};
