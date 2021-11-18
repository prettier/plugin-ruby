import type { Plugin, Ruby } from "../types";
import prettier from "../prettier";

import { getChildNodes } from "../utils";
import embed from "./embed";
import nodes from "./nodes";

const { trim } = prettier;

const noComments = ["args", "args_add_block", "mlhs", "mlhs_paren"];

const printer: Plugin.PrinterConfig<Ruby.AnyNode> = {
  // Certain nodes are used more for organizational purposed than for actually
  // displaying content, so we tell prettier that we don't want comments
  // attached to them.
  canAttachComment(node) {
    return !noComments.includes(node.type);
  },
  embed,
  // This function tells prettier how to recurse down our AST so that it can
  // find where it needs to attach the comments.
  getCommentChildNodes(node: Ruby.AnyNode) {
    return getChildNodes(node);
  },
  // This is an escape-hatch to ignore nodes in the tree. If you have a comment
  // that includes this pattern, then the entire node will be ignored and just
  // the original source will be printed out.
  hasPrettierIgnore(path) {
    const node = path.getValue();

    return (
      (node.comments &&
        node.comments.some((comment) =>
          comment.value.includes("prettier-ignore")
        )) ||
      false
    );
  },
  // To be honest I'm not 100% sure this function is actually necessary, but it
  // *feels* like a block comment equivalent in JavaScript so I'm going to leave
  // it in place for now.
  isBlockComment(comment) {
    return comment.type === "embdoc";
  },
  // This function handles adding the format pragma to a source string. This is
  // an optional workflow for incremental adoption.
  insertPragma(text) {
    const boundary = text.startsWith("#") ? "\n" : "\n\n";

    return `# @format${boundary}${text}`;
  },
  // This is the generic node print function, used to convert any node in the
  // AST into its equivalent Doc representation.
  print(path, opts, print) {
    const node = path.getValue();
    const printer = nodes[node.type];

    if (!printer) {
      throw new Error(`Unsupported node type: ${node.type}`);
    }

    return printer(path, opts, print);
  },
  // This is the generic print function for any comment in the AST. It handles
  // both regular comments that begin with a # and embdoc comments, which are
  // surrounded by =begin..=end.
  printComment(path) {
    const comment = (path as any as Plugin.Path<Ruby.Comment>).getValue();

    if (comment.type === "comment") {
      return `#${comment.value}`;
    }

    return [trim, comment.value];
  }
};

export default printer;
