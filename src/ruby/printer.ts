import type { Printer } from "prettier";
import type { Plugin, Ruby } from "./nodes/types";

const { concat, trim } = require("../prettier");

const embed = require("./embed");
const nodes = require("./nodes");

const noComments = [
  "args",
  "args_add_block",
  "args_add_star",
  "mlhs",
  "mlhs_add_post",
  "mlhs_add_star",
  "mlhs_paren"
];

type PluginPrinter<T> = Printer<T> & {
  getCommentChildNodes: (node: any) => any[],
  isBlockComment: (comment: any, options: Plugin.Options) => boolean
};

const printer: PluginPrinter<Ruby.Node> = {
  // Certain nodes are used more for organizational purposed than for actually
  // displaying content, so we tell prettier that we don't want comments attached
  // to them.
  canAttachComment(node) {
    return !noComments.includes(node.type);
  },
  embed,
  // This function tells prettier how to recurse down our AST so that it can
  // find where it needs to attach the comments. The types on this are a little
  // abysmal, but we're going to leave it as is to get this out.
  getCommentChildNodes(node) {
    switch (node.type) {
      case "heredoc":
        return [node.beging];
      case "aryptn":
        return [node.body[0]]
          .concat(node.body[1])
          .concat(node.body[2])
          .concat(node.body[3]);
      case "hshptn": {
        const pairs = node.body[1];
        const values = pairs.reduce((left: any, right: any) => left.concat(right), []);

        return [node.body[0]].concat(values).concat(node.body[2]);
      }
      case "params": {
        const [reqs, optls, rest, post, kwargs, kwargRest, block] = node.body;
        let parts = reqs || [];

        (optls || []).forEach((optl: any) => {
          parts = parts.concat(optl);
        });

        if (rest) {
          parts.push(rest);
        }

        parts = parts.concat(post || []);

        (kwargs || []).forEach((kwarg: any) => {
          if (kwarg[1]) {
            parts = parts.concat(kwarg);
          } else {
            parts.push(kwarg[0]);
          }
        });

        if (kwargRest && kwargRest !== "nil") {
          parts.push(kwargRest);
        }

        if (block) {
          parts.push(block);
        }

        return parts;
      }
      default: {
        if (Array.isArray(node.body)) {
          return node.body.filter((child: any) => child && typeof child === "object");
        }
        return [];
      }
    }
  },
  // This is an escape-hatch to ignore nodes in the tree. If you have a comment
  // that includes this pattern, then the entire node will be ignored and just the
  // original source will be printed out.
  hasPrettierIgnore(path) {
    const node = path.getValue();

    return (
      node.comments &&
      node.comments.some((comment) => comment.value.includes("prettier-ignore")) ||
      false
    );
  },
  // To be honest I'm not 100% sure this function is actually necessary, but it
  // *feels* like a block comment equivalent in JavaScript so I'm going to leave
  // it in place for now.
  isBlockComment(comment) {
    return comment.type === "@embdoc";
  },
  // This function handles adding the format pragma to a source string. This is an
  // optional workflow for incremental adoption.
  insertPragma(text) {
    const boundary = text.startsWith("#") ? "\n" : "\n\n";

    return `# @format${boundary}${text}`;
  },
  // This is the generic node print function, used to convert any node in the AST
  // into its equivalent Doc representation.
  print(path, opts, print) {
    const { type, body } = path.getValue() as any;

    if (type in nodes) {
      return nodes[type](path, opts, print);
    }

    if (type[0] === "@") {
      return body;
    }

    const ast = JSON.stringify(body, null, 2);
    throw new Error(`Unsupported node encountered: ${type}\n${ast}`);
  },
  // This is the generic print function for any comment in the AST. It handles
  // both regular comments that begin with a # and embdoc comments, which are
  // surrounded by =begin..=end.
  printComment(path, _opts) {
    const comment = (path as any as Plugin.Path<Ruby.Comment>).getValue();

    if (comment.type === "@comment") {
      return `#${comment.value}`;
    }

    return concat([trim, comment.value]);
  }
};

module.exports = printer;
