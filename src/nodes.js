const { align, breakParent, concat, dedent, dedentToRoot, group, hardline, ifBreak, indent, join, line, lineSuffix, literalline, markAsRoot, softline, trim } = require("prettier").doc.builders;
const { concatBody, empty, first, literal, makeCall, prefix, skipAssignIndent, surround } = require("./utils");

module.exports = {
  ...require("./nodes/alias"),
  ...require("./nodes/arrays"),
  ...require("./nodes/blocks"),
  ...require("./nodes/conditionals"),
  ...require("./nodes/hooks"),
  ...require("./nodes/loops"),
  ...require("./nodes/methods"),
  ...require("./nodes/params"),
  ...require("./nodes/regexp"),
  ...require("./nodes/strings"),
  "@int": (path, opts, print) => {
    const { body } = path.getValue();
    return /^0[0-9]/.test(body) ? `0o${body.slice(1)}` : body;
  },
  aref: (path, opts, print) => {
    if (!path.getValue().body[1]) {
      return concat([path.call(print, "body", 0), "[]"]);
    }

    return group(concat([
      path.call(print, "body", 0),
      "[",
      indent(concat([softline, path.call(print, "body", 1)])),
      concat([softline, "]"])
    ]));
  },
  aref_field: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    "[",
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "]"])
  ])),
  arg_paren: (path, opts, print) => {
    if (path.getValue().body[0] === null) {
      return "";
    }

    return group(concat([
      "(",
      indent(concat([softline, path.call(print, "body", 0)])),
      concat([softline, ")"])
    ]))
  },
  args_add: (path, opts, print) => {
    const [leftArg, rightArg] = path.getValue().body;

    if (leftArg.type === "args_new") {
      return path.call(print, "body", 1);
    }

    const buffer = skipAssignIndent(rightArg) ? ", " : concat([",", line]);
    return join(buffer, path.map(print, "body"));
  },
  args_add_block: (path, opts, print) => {
    const [args, block] = path.getValue().body;
    const parts = args.type === "args_new" ? [] : [path.call(print, "body", 0)];

    if (block) {
      if (parts.length > 0) {
        parts.push(",", line);
      }
      parts.push(concat(["&", path.call(print, "body", 1)]));
    }

    return group(concat(parts));
  },
  args_add_star: (path, opts, print) => {
    if (path.getValue().body[0].type === "args_new") {
      return concat(["*", path.call(print, "body", 1)]);
    }

    return concat([
      path.call(print, "body", 0),
      ",",
      line,
      concat(["*", path.call(print, "body", 1)])
    ]);
  },
  args_new: (path, opts, print) => group(concat(["[", softline])),
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
          const { comment } = path.getValue().body[0];

          parts.push(concat([
            path.call(print, "body", 0, "body", 0, "body", 0),
            ":",
            comment ? lineSuffix(` ${comment.body}`) : ""
          ]));
        } else {
          parts.push(concat([printedLabel, " =>"]));
        }
        break;
      default:
        parts.push(concat([printedLabel, " =>"]))
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
  assoclist_from_args: (path, opts, print) => group(
    join(concat([",", line]),
    path.map(print, "body", 0))
  ),
  assign: (path, opts, print) => {
    const [printedTarget, printedValue] = path.map(print, "body");

    if (skipAssignIndent(path.getValue().body[1])) {
      return group(concat([printedTarget, " = ", printedValue]));
    }

    return group(concat([
      printedTarget,
      " =",
      indent(concat([line, printedValue]))
    ]));
  },
  assign_error: (path, opts, print) => {
    throw new Error("Can't set variable");
  },
  bare_assoc_hash: (path, opts, print) => group(join(concat([",", line]), path.map(print, "body", 0))),
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
  block_var: (path, opts, print) => concat(["|", path.call(print, "body", 0), "| "]),
  blockarg: (path, opts, print) => concat(["&", path.call(print, "body", 0)]),
  bodystmt: (path, opts, print) => {
    const [statements, rescue, elseClause, ensure] = path.getValue().body;
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
    const printed = path.call(print, "body", 0);

    if (path.getValue().body[0].body.length === 0) {
      return "break";
    }

    const { contents: { parts: [first] } } = printed;

    if (first && !first.parts || (first.parts && first.parts[0] !== "(")) {
      return concat(["break ", printed]);
    }

    return concat(["break", printed]);
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
      indent(concat([softline, makeCall(path, opts, print), name])),
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
      return group(concat([concat(parts), ifBreak("", "; "), "end"]));
    }

    return group(concat([
      concat(parts),
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ]));
  },
  class_name_error: (path, opts, print) => {
    throw new Error("class/module name must be CONSTANT");
  },
  command: (path, opts, print) => {
    const command = path.call(print, "body", 0);

    // Hate, hate, hate this but can't figure out how to fix it.
    return group(ifBreak(
      concat([command, " ", align(command.length + 1, path.call(print, "body", 1))]),
      concat([command, " ", path.call(print, "body", 1)])
    ));
  },
  command_call: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    makeCall(path, opts, print),
    path.call(print, "body", 2),
    " ",
    path.call(print, "body", 3)
  ])),
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
  else: (path, opts, print) => concat([
    "else",
    indent(concat([softline, path.call(print, "body", 0)]))
  ]),
  elsif: (path, opts, print) => {
    const [_predicate, _statements, addition] = path.getValue().body;
    const parts = [
      group(concat(["elsif ", path.call(print, "body", 0)])),
      indent(concat([hardline, path.call(print, "body", 1)]))
    ];

    if (addition) {
      parts.push(group(concat([hardline, path.call(print, "body", 2)])));
    }

    return group(concat(parts));
  },
  embdoc: (path, opts, print) => concat([trim, path.getValue().body]),
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
  hash: (path, opts, print) => {
    if (path.getValue().body[0] === null) {
      return '{}';
    }

    return group(concat([
      "{",
      indent(concat([line, concat(path.map(print, "body"))])),
      concat([line, "}"])
    ]));
  },
  lambda: (path, opts, print) => {
    let params = path.getValue().body[0];
    let paramsConcat = "";

    if (params.type === "params") {
      paramsConcat = path.call(print, "body", 0);
    } else {
      params = params.body[0];
      paramsConcat = path.call(print, "body", 0, "body", 0);
    }

    const noParams = params.body.every(type => !type);

    return group(ifBreak(
      concat([
        "lambda do",
        noParams ? "" : concat([" |", paramsConcat, "|"]),
        indent(concat([softline, path.call(print, "body", 1)])),
        concat([softline, "end"])
      ]),
      concat([
        "->",
        noParams ? "" : concat(["(", paramsConcat, ")"]),
        " { ",
        path.call(print, "body", 1),
        " }"
      ])
    ));
  },
  massign: (path, opts, print) => group(concat([
    group(join(concat([",", line]), path.call(print, "body", 0))),
    " =",
    indent(concat([line, path.call(print, "body", 1)]))
  ])),
  method_add_arg: (path, opts, print) => {
    if (path.getValue().body[1].type === "args_new") {
      return path.call(print, "body", 0);
    }
    return group(concat(path.map(print, "body")));
  },
  method_add_block: (path, opts, print) => concat(path.map(print, "body")),
  methref: (path, opts, print) => join(".:", path.map(print, "body")),
  mlhs: (path, opts, print) => path.map(print, "body"),
  mlhs_add_post: (path, opts, print) => [
    ...path.call(print, "body", 0),
    ...path.call(print, "body", 1)
  ],
  mlhs_add_star: (path, opts, print) => [
    ...path.call(print, "body", 0),
    path.getValue().body[1] ? concat(["*", path.call(print, "body", 1)]) : "*"
  ],
  mlhs_paren: (path, opts, print) => group(concat([
    "(",
    indent(concat([softline, join(concat([",", line]), path.call(print, "body", 0))])),
    concat([softline, ")"])
  ])),
  mrhs: (path, opts, print) => path.map(print, "body"),
  mrhs_add_star: (path, opts, print) => group(join(
    concat([",", line]),
    [
      ...path.call(print, "body", 0),
      concat(["*", path.call(print, "body", 1)])
    ]
  )),
  mrhs_new_from_args: (path, opts, print) => group(join(
    concat([",", line]),
    path.map(print, "body")
  )),
  module: (path, opts, print) => {
    const declaration = group(concat(["module ", path.call(print, "body", 0)]));

    // If the body is empty, we can replace with a ;
    const stmts = path.getValue().body[1].body[0].body;
    if (stmts.length === 1 && stmts[0].type === "void_stmt") {
      return group(concat([declaration, ifBreak("", "; "), "end"]));
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

    if (args.body[1].type !== "paren") {
      return concat(["next ", path.call(print, "body", 0)]);
    }

    // Ignoring the parens node and just going straight to the content
    return concat(["next ", path.call(print, "body", 0, "body", 0, "body", 1, "body", 0)]);
  },
  opassign: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    " ",
    path.call(print, "body", 1),
    indent(concat([line, path.call(print, "body", 2)]))
  ])),
  paren: surround("(", ")"),
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
          parts.push(" ", path.call(print, "body", 0));
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

    if (args.body[1] && args.body[1].type === "paren") {
      return concat(["return ", path.call(print, "body", 0, "body", 0, "body", 1, "body", 0)]);
    }

    // Ignoring the parens node and just going straight to the content
    return concat(["return ", path.call(print, "body", 0)]);
  },
  return0: literal("return"),
  sclass: (path, opts, print) => group(concat([
    concat(["class << ", path.call(print, "body", 0)]),
    indent(concat([hardline, path.call(print, "body", 1)])),
    concat([hardline, "end"])
  ])),
  stmts: (path, opts, print) => {
    const parts = [];
    let line = null;

    path.getValue().body.forEach((stmt, index) => {
      if (stmt.type === "void_stmt") {
        return;
      }

      const printed = path.call(print, "body", index);

      if (line === null) {
        parts.push(printed);
      } else if (stmt.start - line > 1) {
        parts.push(hardline, hardline, printed);
      } else if (stmt.start === line) {
        parts.push("; ", printed);
      } else {
        parts.push(hardline, printed);
      }

      line = stmt.end;
    });

    return concat(parts);
  },
  super: (path, opts, print) => {
    const buffer = path.getValue().body[0].type === "arg_paren" ? "": " ";

    return group(concat([
      "super",
      buffer,
      path.call(print, "body", 0)
    ]))
  },
  symbol: prefix(":"),
  symbol_literal: concatBody,
  top_const_field: prefix("::"),
  top_const_ref: prefix("::"),
  unary: (path, opts, print) => concat([
    path.getValue().body[0][0],
    path.call(print, "body", 1)
  ]),
  undef: (path, opts, print) => concat([
    "undef ",
    path.call(print, "body", 0, 0)
  ]),
  var_field: concatBody,
  var_ref: first,
  vcall: concatBody,
  when: (path, opts, print) => {
    const [_predicates, _statements, addition] = path.getValue().body;

    const printedStatements = path.call(print, "body", 1);
    const parts = [group(concat(["when ", path.call(print, "body", 0)]))];

    if (!printedStatements.parts.every(part => !part)) {
      parts.push(indent(concat([hardline, printedStatements])));
    }

    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 2)]));
    }

    return group(concat(parts));
  },
  yield: (path, opts, print) => concat([
    "yield",
    path.getValue().body[0].type === "paren" ? "" : " ",
    concat(path.map(print, "body"))
  ]),
  yield0: literal("yield"),
  zsuper: literal("super")
};
