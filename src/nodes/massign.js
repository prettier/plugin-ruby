const { concat, group, indent, join, line, softline } = require("../prettier");
const { makeList } = require("../utils");

module.exports = {
  massign: (path, opts, print) => {
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
  },
  mlhs: makeList,
  mlhs_add_post: (path, opts, print) =>
    path.call(print, "body", 0).concat(path.call(print, "body", 1)),
  mlhs_add_star: (path, opts, print) =>
    path
      .call(print, "body", 0)
      .concat([
        path.getValue().body[1]
          ? concat(["*", path.call(print, "body", 1)])
          : "*"
      ]),
  mlhs_paren: (path, opts, print) => {
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
  },
  mrhs: makeList,
  mrhs_add_star: (path, opts, print) =>
    path
      .call(print, "body", 0)
      .concat([concat(["*", path.call(print, "body", 1)])]),
  mrhs_new_from_args: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    if (path.getValue().body.length > 1) {
      parts.push(path.call(print, "body", 1));
    }

    return parts;
  }
};
