import type { Plugin, Ruby } from "../ruby/types";

const { concat, group, hardline, indent, join, line } = require("../prettier");

function containedWithin(node: Ruby.Array | Ruby.Hash): (comment: Ruby.Comment) => boolean {
  return function containedWithinNode(comment) {
    return comment.sc >= node.sc && comment.ec <= node.ec;
  };
}

// Empty collections are array or hash literals that do not contain any
// contents. They can, however, have comments inside the body. You can solve
// this by having a child node inside the array that gets the comments attached
// to it, but that requires modifying the parser. Instead, we can just manually
// print out the non-leading comments here.
function printEmptyCollection(path: Plugin.Path<Ruby.Array | Ruby.Hash>, opts: Plugin.Options, startToken: string, endToken: string) {
  const node = path.getValue();
  const containedWithinNode = containedWithin(node);

  // If there are no comments or only leading comments, then we can just print
  // out the start and end token and be done, as there are no comments inside
  // the body of this node.
  if (!node.comments || !node.comments.some(containedWithinNode)) {
    return `${startToken}${endToken}`;
  }

  const comments: Plugin.Doc[] = [];

  // For each comment, go through its path and print it out manually.
  const printComment = (commentPath: Plugin.Path<Ruby.Comment>) => {
    const comment = commentPath.getValue();

    if (containedWithinNode(comment)) {
      comment.printed = true;
      comments.push(opts.printer.printComment(commentPath, opts));
    }
  };

  path.each(printComment, "comments");

  return group(
    concat([
      startToken,
      indent(concat([hardline, join(hardline, comments)])),
      line,
      endToken
    ])
  );
}

export default printEmptyCollection;