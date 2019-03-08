const { align, breakParent, concat, dedent, group, hardline, ifBreak, indent, join, line, literalline, markAsRoot, softline, trim } = require("prettier").doc.builders;
const { removeLines } = require("prettier").doc.utils;
const { concatBody, docLength, empty, first, literal, makeCall, makeList, prefix, printComments, skipAssignIndent } = require("./utils");

const nodes = {
  "@int": (path, _opts, _print) => {
    const { body } = path.getValue();
    return /^0[0-9]/.test(body) ? `0o${body.slice(1)}` : body;
  },
  "@__end__": (path, _opts, _print) => {
    const { body } = path.getValue();
    return concat([trim, "__END__", literalline, body]);
  },
  arg_paren: (path, { addTrailingCommas }, print) => {
    if (path.getValue().body[0] === null) {
      return "";
    }

    const args = path.getValue().body[0];
    const hasBlock = args.type === "args_add_block" && args.body[1];

    return group(concat([
      "(",
      indent(concat([
        softline,
        join(concat([",", line]), path.call(print, "body", 0)),
        addTrailingCommas && !hasBlock ? ifBreak(",", "") : ""
      ])),
      concat([softline, ")"])
    ]));
  },
  args: makeList,
  args_add_block: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    if (path.getValue().body[1]) {
      parts.push(concat(["&", path.call(print, "body", 1)]));
    }

    return parts;
  },
  args_add_star: (path, opts, print) => {
    const printed = path.map(print, "body");
    const parts = printed[0].concat([concat(["*", printed[1]])]).concat(printed.slice(2));

    return parts;
  },
  assoc_new: (path, { preferHashLabels }, print) => {
    const parts = [];
    const [printedLabel, printedValue] = path.map(print, "body");

    switch (path.getValue().body[0].type) {
      case "@label":
        if (preferHashLabels) {
          parts.push(printedLabel);
        } else {
          parts.push(`:${printedLabel.slice(0, printedLabel.length - 1)} =>`);
        }
        break;
      case "symbol_literal":
        if (preferHashLabels && path.getValue().body[0].body.length === 1) {
          const { comments, start } = path.getValue().body[0];
          const node = concat([path.call(print, "body", 0, "body", 0, "body", 0), ":"]);

          if (comments) {
            parts.push(printComments(node, start, comments));
          } else {
            parts.push(node);
          }
        } else {
          parts.push(concat([printedLabel, " =>"]));
        }
        break;
      default:
        parts.push(concat([printedLabel, " =>"]));
        break;
    }

    if (skipAssignIndent(path.getValue().body[1])) {
      parts.push(" ", printedValue);
    } else {
      parts.push(indent(concat([line, printedValue])));
    }

    return group(concat(parts));
  },
  assoc_splat: prefix("**"),
  assoclist_from_args: (path, opts, print) => group(join(
    concat([",", line]),
    path.map(print, "body", 0)
  )),
  assign: (path, opts, print) => {
    const [printedTarget, printedValue] = path.map(print, "body");
    let adjustedValue = printedValue;

    if (["mrhs_add_star", "mrhs_new_from_args"].includes(path.getValue().body[1].type)) {
      adjustedValue = group(join(concat([",", line]), printedValue));
    }

    if (skipAssignIndent(path.getValue().body[1])) {
      return group(concat([printedTarget, " = ", adjustedValue]));
    }

    return group(concat([
      printedTarget,
      " =",
      indent(concat([line, adjustedValue]))
    ]));
  },
  assign_error: (_path, _opts, _print) => {
    throw new Error("Can't set variable");
  },
  bare_assoc_hash: (path, opts, print) => group(
    join(concat([",", line]), path.map(print, "body", 0))
  ),
  begin: (path, opts, print) => group(concat([
    "begin",
    indent(concat([hardline, concat(path.map(print, "body"))])),
    group(concat([hardline, "end"]))
  ])),
  binary: (path, opts, print) => {
    const operator = path.getValue().body[1];
    const useNoSpace = operator === "**";

    return group(concat([
      concat([path.call(print, "body", 0), useNoSpace ? "" : " "]),
      operator,
      indent(concat([useNoSpace ? softline : line, path.call(print, "body", 2)]))
    ]));
  },
  block_var: (path, opts, print) => concat(["|", removeLines(path.call(print, "body", 0)), "| "]),
  blockarg: (path, opts, print) => concat(["&", path.call(print, "body", 0)]),
  bodystmt: (path, opts, print) => {
    const [_statements, rescue, elseClause, ensure] = path.getValue().body;
    const parts = [path.call(print, "body", 0)];

    if (rescue) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 1)])));
    }

    if (elseClause) {
      // Before Ruby 2.6, this piece of bodystmt was an explicit "else" node
      const stmts = elseClause.type === "else" ? path.call(print, "body", 2, "body", 0) : path.call(print, "body", 2);

      parts.push(concat([dedent(concat([hardline, "else"])), hardline, stmts]));
    }

    if (ensure) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 3)])));
    }

    return group(concat(parts));
  },
  break: (path, opts, print) => {
    const content = path.getValue().body[0];

    if (content.body.length === 0) {
      return "break";
    }

    if (content.body[0].body[0].type === "paren") {
      return concat(["break ", path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)]);
    }

    return concat(["break ", join(", ", path.call(print, "body", 0))]);
  },
  call: (path, opts, print) => {
    let name = path.getValue().body[2];

    // You can call lambdas with a special syntax that looks like func.(*args).
    // In this case, "call" is returned for the 3rd child node.
    if (name !== "call") {
      name = path.call(print, "body", 2);
    }

    return group(concat([
      path.call(print, "body", 0),
      indent(concat([softline, makeCall(path, opts, print), name]))
    ]));
  },
  case: (path, opts, print) => {
    const parts = ["case "];

    if (path.getValue().body[0]) {
      parts.push(path.call(print, "body", 0));
    }

    parts.push(
      group(concat([hardline, path.call(print, "body", 1)])),
      group(concat([hardline, "end"]))
    );

    return group(concat(parts));
  },
  class: (path, opts, print) => {
    const [_constant, superclass, statements] = path.getValue().body;

    const parts = ["class ", path.call(print, "body", 0)];
    if (superclass) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    // If the body is empty, we can replace with a ;
    const stmts = statements.body[0].body;
    if (stmts.length === 1 && stmts[0].type === "void_stmt") {
      return group(concat([concat(parts), ifBreak(line, "; "), "end"]));
    }

    return group(concat([
      concat(parts),
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ]));
  },
  class_name_error: (_path, _opts, _print) => {
    throw new Error("class/module name must be CONSTANT");
  },
  command: (path, opts, print) => {
    const command = path.call(print, "body", 0);
    const args = join(concat([",", line]), path.call(print, "body", 1));

    // Hate, hate, hate this but can't figure out how to fix it.
    return group(ifBreak(
      concat([command, " ", align(command.length + 1, args)]),
      concat([command, " ", args])
    ));
  },
  command_call: (path, opts, print) => {
    const parts = [
      path.call(print, "body", 0),
      makeCall(path, opts, print),
      path.call(print, "body", 2)
    ];

    if (!path.getValue().body[3]) {
      return concat(parts);
    }

    parts.push(" ");
    const args = join(concat([",", line]), path.call(print, "body", 3));

    return group(ifBreak(
      concat(parts.concat([align(docLength(concat(parts)), args)])),
      concat(parts.concat([args]))
    ));
  },
  const_path_field: (path, opts, print) => join("::", path.map(print, "body")),
  const_path_ref: (path, opts, print) => join("::", path.map(print, "body")),
  const_ref: first,
  defined: (path, opts, print) => group(concat([
    "defined?(",
    indent(concat([softline, path.call(print, "body", 0)])),
    concat([softline, ")"])
  ])),
  dot2: (path, opts, print) => concat([
    path.call(print, "body", 0),
    "..",
    path.getValue().body[1] ? path.call(print, "body", 1) : ""
  ]),
  dot3: (path, opts, print) => concat([
    path.call(print, "body", 0),
    "...",
    path.getValue().body[1] ? path.call(print, "body", 1) : ""
  ]),
  dyna_symbol: (path, opts, print) => concat([
    ":\"",
    concat(path.call(print, "body", 0)),
    "\""
  ]),
  else: (path, opts, print) => {
    const stmts = path.getValue().body[0];

    return concat([
      stmts.body.length === 1 && stmts.body[0].type === "command" ? breakParent : "",
      "else",
      indent(concat([softline, path.call(print, "body", 0)]))
    ]);
  },
  embdoc: (path, _opts, _print) => concat([trim, path.getValue().body]),
  ensure: (path, opts, print) => group(concat([
    "ensure",
    indent(concat([hardline, concat(path.map(print, "body"))]))
  ])),
  excessed_comma: empty,
  fcall: concatBody,
  field: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    concat([makeCall(path, opts, print), path.call(print, "body", 2)])
  ])),
  hash: (path, { addTrailingCommas }, print) => {
    if (path.getValue().body[0] === null) {
      return "{}";
    }

    return group(concat([
      "{",
      indent(concat([
        line,
        concat(path.map(print, "body")),
        addTrailingCommas ? ifBreak(",", "") : ""
      ])),
      concat([line, "}"])
    ]));
  },
  lambda: (path, opts, print) => {
    let params = path.getValue().body[0];
    let paramsConcat = "";

    if (params.type === "params") {
      paramsConcat = path.call(print, "body", 0);
    } else {
      ([params] = params.body);
      paramsConcat = path.call(print, "body", 0, "body", 0);
    }

    const noParams = params.body.every(type => !type);
    const commandNode = path.getParentNode(2);

    const inlineLambda = concat([
      "->",
      noParams ? "" : concat(["(", paramsConcat, ")"]),
      " { ",
      path.call(print, "body", 1),
      " }"
    ]);

    if (commandNode && ["command", "command_call"].includes(commandNode.type)) {
      return group(ifBreak(
        concat([
          "lambda {",
          noParams ? "" : concat([" |", removeLines(paramsConcat), "|"]),
          indent(concat([line, path.call(print, "body", 1)])),
          concat([line, "}"])
        ]),
        inlineLambda
      ));
    }

    return group(ifBreak(
      concat([
        "lambda do",
        noParams ? "" : concat([" |", removeLines(paramsConcat), "|"]),
        indent(concat([softline, path.call(print, "body", 1)])),
        concat([softline, "end"])
      ]),
      inlineLambda
    ));
  },
  massign: (path, opts, print) => {
    let right = path.call(print, "body", 1);

    if (["mrhs_add_star", "mrhs_new_from_args"].includes(path.getValue().body[1].type)) {
      right = group(join(concat([",", line]), right));
    }

    return group(concat([
      group(join(concat([",", line]), path.call(print, "body", 0))),
      " =",
      indent(concat([line, right]))
    ]));
  },
  method_add_arg: (path, opts, print) => {
    if (path.getValue().body[1].type === "args_new") {
      return path.call(print, "body", 0);
    }
    return group(concat(path.map(print, "body")));
  },
  method_add_block: (path, opts, print) => concat(path.map(print, "body")),
  methref: (path, opts, print) => join(".:", path.map(print, "body")),
  mlhs: makeList,
  mlhs_add_post: (path, opts, print) => (
    path.call(print, "body", 0).concat(path.call(print, "body", 1))
  ),
  mlhs_add_star: (path, opts, print) => (
    path.call(print, "body", 0).concat([
      path.getValue().body[1] ? concat(["*", path.call(print, "body", 1)]) : "*"
    ])
  ),
  mlhs_paren: (path, opts, print) => {
    if (["massign", "mlhs_paren"].includes(path.getParentNode().type)) {
      // If we're nested in brackets as part of the left hand side of an
      // assignment, i.e., (a, b, c) = 1, 2, 3
      // ignore the current node and just go straight to the content
      return path.call(print, "body", 0);
    }

    return group(concat([
      "(",
      indent(concat([softline, join(concat([",", line]), path.call(print, "body", 0))])),
      concat([softline, ")"])
    ]));
  },
  mrhs: makeList,
  mrhs_add_star: (path, opts, print) => (
    path.call(print, "body", 0).concat([concat(["*", path.call(print, "body", 1)])])
  ),
  mrhs_new_from_args: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    if (path.getValue().body.length > 1) {
      parts.push(path.call(print, "body", 1));
    }

    return parts;
  },
  module: (path, opts, print) => {
    const declaration = group(concat(["module ", path.call(print, "body", 0)]));

    // If the body is empty, we can replace with a ;
    const stmts = path.getValue().body[1].body[0].body;
    if (stmts.length === 1 && stmts[0].type === "void_stmt") {
      return group(concat([declaration, ifBreak(line, "; "), "end"]));
    }

    return group(concat([
      declaration,
      indent(concat([hardline, path.call(print, "body", 1)])),
      concat([hardline, "end"])
    ]));
  },
  next: (path, opts, print) => {
    const args = path.getValue().body[0].body[0];

    if (!args) {
      return "next";
    }

    if (args.body[0].type === "paren") {
      // Ignoring the parens node and just going straight to the content
      return concat(["next ", path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)]);
    }

    return concat(["next ", join(", ", path.call(print, "body", 0))]);
  },
  opassign: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    " ",
    path.call(print, "body", 1),
    indent(concat([line, path.call(print, "body", 2)]))
  ])),
  paren: (path, opts, print) => {
    if (!path.getValue().body[0]) {
      return "()";
    }

    let content = path.call(print, "body", 0);

    if (["args", "args_add_star", "args_add_block"].includes(path.getValue().body[0].type)) {
      content = join(concat([",", line]), content);
    }

    return group(concat([
      "(",
      indent(concat([softline, content])),
      concat([softline, ")"])
    ]));
  },
  program: (path, opts, print) => markAsRoot(concat([
    join(literalline, path.map(print, "body")),
    literalline
  ])),
  redo: literal("redo"),
  rescue: (path, opts, print) => {
    const [exception, variable, _statements, addition] = path.getValue().body;
    const parts = ["rescue"];

    if (exception || variable) {
      if (exception) {
        if (Array.isArray(exception)) {
          parts.push(" ", path.call(print, "body", 0, 0));
        } else {
          parts.push(
            " ",
            align("rescue ".length, group(join(concat([",", line]), path.call(print, "body", 0))))
          );
        }
      }

      if (variable) {
        parts.push(group(concat([" => ", path.call(print, "body", 1)])));
      }
    } else {
      parts.push(" StandardError");
    }

    parts.push(indent(concat([hardline, path.call(print, "body", 2)])));

    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 3)]));
    }

    return group(concat(parts));
  },
  rescue_mod: (path, opts, print) => group(concat([
    "begin",
    indent(concat([hardline, path.call(print, "body", 0)])),
    hardline,
    "rescue StandardError",
    indent(concat([hardline, path.call(print, "body", 1)])),
    hardline,
    "end"
  ])),
  retry: literal("retry"),
  return: (path, opts, print) => {
    const args = path.getValue().body[0].body[0];

    if (!args) {
      return "return";
    }

    if (args.body[0] && args.body[0].type === "paren") {
      // Ignoring the parens node and just going straight to the content
      return concat(["return ", path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)]);
    }

    return concat(["return ", join(", ", path.call(print, "body", 0))]);
  },
  return0: literal("return"),
  sclass: (path, opts, print) => group(concat([
    concat(["class << ", path.call(print, "body", 0)]),
    indent(concat([hardline, path.call(print, "body", 1)])),
    concat([hardline, "end"])
  ])),
  stmts: (path, opts, print) => {
    const parts = [];
    let lineNo = null;

    path.getValue().body.forEach((stmt, index) => {
      if (stmt.type === "void_stmt") {
        return;
      }

      const printed = path.call(print, "body", index);

      if (lineNo === null) {
        parts.push(printed);
      } else if (stmt.start - lineNo > 1) {
        parts.push(hardline, hardline, printed);
      } else if (stmt.start !== lineNo || path.getParentNode().type !== "string_embexpr") {
        parts.push(hardline, printed);
      } else {
        parts.push("; ", printed);
      }

      lineNo = stmt.end;
    });

    return concat(parts);
  },
  super: (path, opts, print) => {
    const args = path.getValue().body[0];

    if (args.type === "arg_paren") {
      // In case there are explicitly no arguments but they are using parens,
      // we assume they are attempting to override the initializer and pass no
      // arguments up.
      if (args.body[0] === null) {
        return "super()";
      }

      return concat(["super", path.call(print, "body", 0)]);
    }

    return concat(["super ", join(", ", path.call(print, "body", 0))]);
  },
  symbol: prefix(":"),
  symbol_literal: concatBody,
  top_const_field: prefix("::"),
  top_const_ref: prefix("::"),
  unary: (path, opts, print) => {
    const operator = path.getValue().body[0];

    return concat([
      operator === "not" ? "not " : operator[0],
      path.call(print, "body", 1)
    ]);
  },
  undef: (path, opts, print) => group(concat([
    "undef ",
    align(
      "undef ".length,
      join(concat([",", line]), path.map(print, "body", 0))
    )
  ])),
  var_field: concatBody,
  var_ref: first,
  vcall: first,
  when: (path, opts, print) => {
    const [_predicates, _statements, addition] = path.getValue().body;

    const stmts = path.call(print, "body", 1);
    const parts = [group(concat(["when ", join(", ", path.call(print, "body", 0))]))];

    if (!stmts.parts.every(part => !part)) {
      parts.push(indent(concat([hardline, stmts])));
    }

    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 2)]));
    }

    return group(concat(parts));
  },
  yield: (path, opts, print) => {
    if (path.getValue().body[0].type === "paren") {
      return concat(["yield", path.call(print, "body", 0)]);
    }

    return concat(["yield ", join(", ", path.call(print, "body", 0))]);
  },
  yield0: literal("yield"),
  zsuper: literal("super")
};

module.exports = Object.assign(
  {},
  require("./nodes/alias"),
  require("./nodes/arrays"),
  require("./nodes/blocks"),
  require("./nodes/conditionals"),
  require("./nodes/hooks"),
  require("./nodes/loops"),
  require("./nodes/methods"),
  require("./nodes/params"),
  require("./nodes/regexp"),
  require("./nodes/strings"),
  nodes
);
