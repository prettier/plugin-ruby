const {
  concat,
  group,
  indent,
  join,
  line,
  softline
} = require("../../prettier");

function printMAssign(path, opts, print) {
  let right = path.call(print, "body", 1);

  if (
    ["mrhs_add_star", "mrhs_new_from_args"].includes(
      path.getValue().body[1].type
    )
  ) {
    right = group(join(concat([",", line]), right));
  }

  const parts = [join(concat([",", line]), path.call(print, "body", 0))];
  if (path.getValue().body[0].comma) {
    parts.push(",");
  }

  return group(
    concat([group(concat(parts)), " =", indent(concat([line, right]))])
  );
}

function printMLHS(path, opts, print) {
  return path.map(print, "body");
}

function printMLHSAddPost(path, opts, print) {
  return path.call(print, "body", 0).concat(path.call(print, "body", 1));
}

function printMLHSAddStar(path, opts, print) {
  const rightParts = ["*"];

  if (path.getValue().body[1]) {
    rightParts.push(path.call(print, "body", 1));
  }

  return path.call(print, "body", 0).concat(concat(rightParts));
}

function printMLHSParen(path, opts, print) {
  if (["massign", "mlhs_paren"].includes(path.getParentNode().type)) {
    // If we're nested in brackets as part of the left hand side of an
    // assignment, i.e., (a, b, c) = 1, 2, 3
    // ignore the current node and just go straight to the content
    return path.call(print, "body", 0);
  }

  const parts = [
    softline,
    join(concat([",", line]), path.call(print, "body", 0))
  ];

  if (path.getValue().body[0].comma) {
    parts.push(",");
  }

  return group(concat(["(", indent(concat(parts)), concat([softline, ")"])]));
}

function printMRHS(path, opts, print) {
  return path.map(print, "body");
}

function printMRHSAddStar(path, opts, print) {
  const [leftDoc, rightDoc] = path.map(print, "body");

  return leftDoc.concat([concat(["*", rightDoc])]);
}

function printMRHSNewFromArgs(path, opts, print) {
  const parts = path.call(print, "body", 0);

  if (path.getValue().body[1]) {
    parts.push(path.call(print, "body", 1));
  }

  return parts;
}

module.exports = {
  massign: printMAssign,
  mlhs: printMLHS,
  mlhs_add_post: printMLHSAddPost,
  mlhs_add_star: printMLHSAddStar,
  mlhs_paren: printMLHSParen,
  mrhs: printMRHS,
  mrhs_add_star: printMRHSAddStar,
  mrhs_new_from_args: printMRHSNewFromArgs
};
