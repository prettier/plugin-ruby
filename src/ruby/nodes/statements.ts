import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { isEmptyStmts } from "../../utils";

const {
  breakParent,
  dedent,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline,
  trim
} = prettier;

export const printBodyStmt: Plugin.Printer<Ruby.Bodystmt> = (
  path,
  opts,
  print
) => {
  const [stmts, rescue, elseClause, ensure] = path.getValue().body;
  const parts = [];

  if (!isEmptyStmts(stmts)) {
    parts.push(path.call(print, "body", 0));
  }

  if (rescue) {
    parts.push(dedent([hardline, path.call(print, "body", 1)]));
  }

  if (elseClause) {
    // Before Ruby 2.6, this piece of bodystmt was an explicit "else" node
    /* istanbul ignore next */
    const stmts =
      (elseClause as any).type === "else"
        ? path.call(print, "body", 2, "body", 0)
        : path.call(print, "body", 2);

    parts.push([dedent([hardline, "else"]), hardline, stmts]);
  }

  if (ensure) {
    parts.push(dedent([hardline, path.call(print, "body", 3)]));
  }

  return group(parts);
};

const argNodeTypes = ["args", "args_add_star", "args_add_block"];

export const printParen: Plugin.Printer<Ruby.Paren> = (path, opts, print) => {
  const contentNode = path.getValue().body[0];

  if (!contentNode) {
    return [path.call(print, "lparen"), ")"];
  }

  let contentDoc = path.call(print, "body", 0);

  // If the content is params, we're going to let it handle its own parentheses
  // so that it breaks nicely.
  if (contentNode.type === "params") {
    return contentDoc;
  }

  // If we have an arg type node as the contents, then it's going to return an
  // array, so we need to explicitly join that content here.
  if (argNodeTypes.includes(contentNode.type)) {
    contentDoc = join([",", line], contentDoc);
  }

  return group([
    path.call(print, "lparen"),
    indent([softline, contentDoc]),
    softline,
    ")"
  ]);
};

export const printEndContent: Plugin.Printer<Ruby.EndContent> = (path) => {
  const { body } = path.getValue();
  return [trim, "__END__", literalline, body];
};

export const printComment: Plugin.Printer<Ruby.Comment> = (path, opts) => {
  return opts.printer.printComment(path, opts);
};

export const printProgram: Plugin.Printer<Ruby.Program> = (
  path,
  opts,
  print
) => {
  return [join(hardline, path.map(print, "body")), hardline];
};

type StmtsVoidWithComments = Ruby.Stmts & {
  body: [{ type: "void_stmt"; comments: Ruby.Comment[] }];
};

export const printStmts: Plugin.Printer<Ruby.Stmts> = (path, opts, print) => {
  const stmts = path.getValue().body;

  // This is a special case where we have only comments inside a statement
  // list. In this case we want to avoid doing any kind of line number
  // tracking and just print out the comments.
  if (
    stmts.length === 1 &&
    stmts[0].type === "void_stmt" &&
    stmts[0].comments
  ) {
    const nodePath = path as Plugin.Path<StmtsVoidWithComments>;
    const comments = nodePath.map(
      (commentPath) => {
        commentPath.getValue().printed = true;
        return opts.printer.printComment(commentPath, opts);
      },
      "body",
      0,
      "comments"
    );

    return [breakParent, join(hardline, comments)];
  }

  const parts: Plugin.Doc[] = [];
  let lineNo: null | number = null;

  stmts.forEach((stmt, index) => {
    if (stmt.type === "void_stmt") {
      return;
    }

    const printed = path.call(print, "body", index);

    if (lineNo === null) {
      parts.push(printed);
    } else if (
      stmt.sl - lineNo > 1 ||
      [stmt.type, stmts[index - 1].type].includes("access_ctrl")
    ) {
      parts.push(hardline, hardline, printed);
    } else if (
      stmt.sl !== lineNo ||
      path.getParentNode().type !== "string_embexpr"
    ) {
      parts.push(hardline, printed);
    } else {
      parts.push("; ", printed);
    }

    lineNo = stmt.el;
  });

  return parts;
};
