const {
  align, concat, dedent, group, hardline, ifBreak, indent, join, line,
  lineSuffix, literalline, markAsRoot, softline
} = require("prettier").doc.builders;

const alias = require("./nodes/alias");
const blocks = require("./nodes/blocks");
const conditionals = require("./nodes/conditionals");
const hooks = require("./nodes/hooks");
const loops = require("./nodes/loops");
const methods = require("./nodes/methods");
const params = require("./nodes/params");
const regexp = require("./nodes/regexp");
const statements = require("./nodes/statements");

const concatBody = (path, options, print) => concat(path.map(print, "body"));

const shouldSkipAssignIndent = node => (
  ["array", "hash"].includes(node.type) ||
    (node.type === "call" && shouldSkipAssignIndent(node.body[0]))
);

const nodes = {
  ...alias,
  ...blocks,
  ...conditionals,
  ...hooks,
  ...loops,
  ...methods,
  ...params,
  ...regexp,
  ...statements,
  aref: (path, options, print) => {
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
  aref_field: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    "[",
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "]"])
  ])),
  arg_paren: (path, options, print) => {
    if (path.getValue().body[0] === null) {
      return "";
    }

    return group(concat([
      "(",
      indent(concat([softline, path.call(print, "body", 0)])),
      concat([softline, ")"])
    ]))
  },
  args_add: (path, options, print) => {
    const [leftArg, rightArg] = path.getValue().body;

    if (leftArg.type === "args_new") {
      return path.call(print, "body", 1);
    }

    const buffer = shouldSkipAssignIndent(rightArg) ? ", " : concat([",", line]);
    return join(buffer, path.map(print, "body"));
  },
  args_add_block: (path, options, print) => {
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
  args_add_star: (path, options, print) => {
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
  args_new: (path, options, print) => group(concat(["[", softline])),
  array: (path, options, print) => {
    if (path.getValue().body[0] === null) {
      return '[]';
    }

    return group(concat([
      path.getValue().body[0].type === "args_add" ? "[" : "",
      indent(concat([softline, path.call(print, "body", 0)])),
      concat([softline, "]"])
    ]));
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
        if (preferHashLabels) {
          parts.push(concat([printedLabel.parts[0].parts[1], ":"]));
        } else {
          parts.push(concat([printedLabel, " =>"]));
        }
        break;
      default:
        parts.push(concat([printedLabel, " =>"]))
        break;
    }

    if (shouldSkipAssignIndent(path.getValue().body[1])) {
      parts.push(" ", printedValue);
    } else {
      parts.push(indent(concat([line, printedValue])));
    }

    return group(concat(parts));
  },
  assoc_splat: (path, options, print) => group(concat([
    "**",
    path.call(print, "body", 0)
  ])),
  assoclist_from_args: (path, options, print) => group(
    join(concat([",", line]),
    path.map(print, "body", 0))
  ),
  assign: (path, options, print) => {
    const [printedTarget, printedValue] = path.map(print, "body");

    if (shouldSkipAssignIndent(path.getValue().body[1])) {
      return group(concat([printedTarget, " = ", printedValue]));
    }

    return group(concat([
      printedTarget,
      " =",
      indent(concat([line, printedValue]))
    ]));
  },
  assign_error: (path, options, print) => {
    throw new Error("Can't set variable");
  },
  bare_assoc_hash: (path, options, print) => group(
    join(concat([",", line]),
    path.map(print, "body", 0)
  )),
  begin: (path, options, print) => group(concat([
    "begin",
    indent(concat([hardline, concat(path.map(print, "body"))])),
    group(concat([hardline, "end"]))
  ])),
  binary: (path, options, print) => {
    const operator = path.getValue().body[1];
    const useNoSpace = operator === "**";

    return group(concat([
      concat([path.call(print, "body", 0), useNoSpace ? "" : " "]),
      operator,
      indent(concat([useNoSpace ? softline : line, path.call(print, "body", 2)]))
    ]));
  },
  block_var: (path, options, print) => concat(["|", path.call(print, "body", 0), "| "]),
  blockarg: (path, options, print) => concat(["&", path.call(print, "body", 0)]),
  bodystmt: (path, options, print) => {
    const [statements, rescue, elseClause, ensure] = path.getValue().body;
    const parts = [path.call(print, "body", 0)];

    if (rescue) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 1)])));
    }

    if (elseClause) {
      parts.push(concat([dedent(concat([hardline, "else"])), hardline, path.call(print, "body", 2)]));
    }

    if (ensure) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 3)])));
    }

    return group(concat(parts));
  },
  break: (path, options, print) => {
    const printed = path.call(print, "body", 0);
    const { contents: { parts: [first] } } = printed;

    if (first === "[") {
      return "break";
    }

    if (first && !first.parts || (first.parts && first.parts[0] !== "(")) {
      return concat(["break ", printed]);
    }

    return concat(["break", printed]);
  },
  call: (path, options, print) => {
    let name = path.getValue().body[2];

    // You can call lambdas with a special syntax that looks like func.(*args).
    // In this case, "call" is returned for the 3rd child node.
    if (name !== "call") {
      name = path.call(print, "body", 2);
    }

    return concat([
      path.call(print, "body", 0),
      path.call(print, "body", 1),
      name
    ]);
  },
  case: (path, options, print) => {
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
  class: (path, options, print) => {
    const [_constant, superclass, _statements] = path.getValue().body;

    const printedStatements = path.call(print, "body", 2);
    const emptyStatements = printedStatements.contents.parts[0] === "";

    const parts = ["class ", path.call(print, "body", 0)];
    if (superclass) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    if (printedStatements.contents.parts[0].parts.every(part => !part)) {
      return group(concat([concat(parts), ifBreak("", "; "), "end"]));
    }

    return group(concat([
      concat(parts),
      indent(concat([hardline, printedStatements])),
      concat([hardline, "end"])
    ]));
  },
  class_name_error: (path, options, print) => {
    throw new Error("class/module name must be CONSTANT");
  },
  command: (path, options, print) => group(join(" ", path.map(print, "body"))),
  command_call: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    path.call(print, "body", 1),
    path.call(print, "body", 2),
    " ",
    path.call(print, "body", 3)
  ])),
  comment: (path, options, print) => lineSuffix(` ${path.getValue().body.trim()}`),
  const_path_field: (path, options, print) => join("::", path.map(print, "body")),
  const_path_ref: (path, options, print) => join("::", path.map(print, "body")),
  const_ref: (path, options, print) => path.call(print, "body", 0),
  defined: (path, options, print) => group(concat([
    "defined?(",
    indent(concat([softline, path.call(print, "body", 0)])),
    concat([softline, ")"])
  ])),
  dot2: (path, options, print) => concat([
    path.call(print, "body", 0),
    "..",
    path.getValue().body[1] ? path.call(print, "body", 1) : ""
  ]),
  dot3: (path, options, print) => concat([
    path.call(print, "body", 0),
    "...",
    path.getValue().body[1] ? path.call(print, "body", 1) : ""
  ]),
  dyna_symbol: (path, options, print) => concat([
    ":\"",
    concat(path.map(print, "body")),
    "\""
  ]),
  else: (path, options, print) => concat([
    "else",
    indent(concat([softline, path.call(print, "body", 0)]))
  ]),
  elsif: (path, options, print) => {
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
  ensure: (path, options, print) => group(concat([
    "ensure",
    indent(concat([hardline, concat(path.map(print, "body"))]))
  ])),
  excessed_comma: (path, options, print) => "",
  fcall: concatBody,
  field: (path, options, print) => group(concat(path.map(print, "body"))),
  hash: (path, options, print) => {
    if (path.getValue().body[0] === null) {
      return '{}';
    }

    return group(concat([
      "{",
      indent(concat([line, concat(path.map(print, "body"))])),
      concat([line, "}"])
    ]));
  },
  lambda: (path, options, print) => {
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
  massign: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    " =",
    indent(concat([line, path.call(print, "body", 1)]))
  ])),
  method_add_arg: (path, options, print) => {
    if (path.getValue().body[1].type === "args_new") {
      return path.call(print, "body", 0);
    }
    return group(concat(path.map(print, "body")));
  },
  method_add_block: (path, options, print) => concat(path.map(print, "body")),
  mlhs_add: (path, options, print) => {
    if (path.getValue().body[0].type === "mlhs_new") {
      return path.call(print, "body", 1);
    }

    return join(", ", path.map(print, "body"));
  },
  mlhs_add_post: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    ",",
    group(concat([line, path.call(print, "body", 1)]))
  ])),
  mlhs_add_star: (path, options, print) => {
    const [leftAssign, paramName] = path.getValue().body;

    const left = leftAssign.type !== "mlhs_new" ? concat([path.call(print, "body", 0), ",", line]) : "";
    const star = paramName ? concat(["*", path.call(print, "body", 1)]) : "*"

    return group(concat([left, star]));
  },
  mlhs_paren: (path, options, print) => group(concat([
    "(",
    indent(concat([softline, path.call(print, "body", 0)])),
    concat([softline, ")"])
  ])),
  mrhs_add: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    ",",
    line,
    path.call(print, "body", 1)
  ])),
  mrhs_add_star: (path, options, print) => group(concat([
    "*",
    concat(path.map(print, "body"))
  ])),
  mrhs_new: (path, options, print) => "",
  mrhs_new_from_args: (path, options, print) => path.call(print, "body", 0),
  module: (path, options, print) => group(concat([
    group(concat(["module ", path.call(print, "body", 0)])),
    indent(concat([hardline, path.call(print, "body", 1)])),
    concat([hardline, "end"])
  ])),
  next: (path, options, print) => {
    if (path.getValue().body[0].type !== "args_new") {
      return concat(["next ", path.call(print, "body", 0)]);
    }
    return "next";
  },
  opassign: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    " ",
    path.call(print, "body", 1),
    indent(concat([line, path.call(print, "body", 2)]))
  ])),
  paren: (path, options, print) => concat([
    "(",
    concat(path.map(print, "body")),
    ")"
  ]),
  program: (path, options, print) => markAsRoot(concat([
    join(literalline, path.map(print, "body")),
    literalline
  ])),
  qsymbols_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "qsymbols_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  qsymbols_new: (path, options, print) => group(concat(["%i[", softline])),
  qwords_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "qwords_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  qwords_new: (path, options, print) => group(concat(["%w[", softline])),
  redo: (path, options, print) => "redo",
  rescue: (path, options, print) => {
    const [exception, variable, _statements, addition] = path.getValue().body;
    const parts = ["rescue"];

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

    parts.push(indent(concat([hardline, path.call(print, "body", 2)])));

    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 3)]));
    }

    return group(concat(parts));
  },
  rescue_mod: (path, options, print) => group(join(" rescue ", path.map(print, "body"))),
  retry: (path, options, print) => "retry",
  return: (path, options, print) => group(concat(["return ", concat(path.map(print, "body"))])),
  return0: (path, options, print) => "return",
  sclass: (path, options, print) => group(concat([
    concat(["class << ", path.call(print, "body", 0)]),
    indent(concat([hardline, path.call(print, "body", 1)])),
    concat([hardline, "end"])
  ])),
  string_add: (path, options, print) => [
    ...path.call(print, "body", 0),
    path.call(print, "body", 1)
  ],
  string_concat: (path, options, print) => group(concat([
    path.call(print, "body", 0),
    " \\",
    indent(concat([hardline, path.call(print, "body", 1)]))
  ])),
  string_content: (path, options, print) => "",
  string_dvar: (path, options, print) => concat([
    "#{",
    path.call(print, "body", 0),
    "}"
  ]),
  string_embexpr: (path, options, print) => concat([
    "#{",
    path.call(print, "body", 0),
    "}"
  ]),
  string_literal: (path, { preferSingleQuotes }, print) => {
    const parts = path.call(print, "body", 0);
    if (parts === '') {
      return preferSingleQuotes ? "''" : "\"\"";
    }

    let delim = "\"";
    if (preferSingleQuotes && parts.every(part => !part.parts || part.parts[0] !== "#{")) {
      delim = "\'";
    }

    return concat([delim, ...parts, delim]);
  },
  super: (path, options, print) => {
    const buffer = path.getValue().body[0].type === "arg_paren" ? "": " ";

    return group(concat([
      "super",
      buffer,
      path.call(print, "body", 0)
    ]))
  },
  symbol: (path, options, print) => concat([
    ":",
    concat(path.map(print, "body"))
  ]),
  symbol_literal: concatBody,
  symbols_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "symbols_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  symbols_new: (path, options, print) => group(concat(["%I[", softline])),
  top_const_field: (path, options, print) => group(concat([
    "::",
    path.call(print, "body", 0)
  ])),
  top_const_ref: (path, options, print) => group(concat([
    "::",
    path.call(print, "body", 0)
  ])),
  unary: (path, options, print) => concat([
    path.getValue().body[0][0],
    path.call(print, "body", 1)
  ]),
  undef: (path, options, print) => concat([
    "undef ",
    path.call(print, "body", 0, 0)
  ]),
  var_field: concatBody,
  var_ref: (path, options, print) => path.call(print, "body", 0),
  vcall: concatBody,
  when: (path, options, print) => {
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
  word_add: concatBody,
  word_new: (path, options, print) => "",
  words_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "words_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  words_new: (path, options, print) => group(concat(["%W[", softline])),
  xstring_add: concatBody,
  xstring_literal: (path, options, print) => group(concat([
    "%x[",
    indent(concat([softline, path.call(print, "body", 0)])),
    concat([softline, "]"])
  ])),
  xstring_new: (path, options, print) => "",
  yield: (path, options, print) => concat([
    "yield",
    path.getValue().body[0].type === "paren" ? "" : " ",
    concat(path.map(print, "body"))
  ]),
  yield0: (path, options, print) => "yield",
  zsuper: (path, options, print) => "super"
};

const genericPrint = (path, options, print) => {
  const { type, body } = path.getValue();
  const printer = nodes[type];

  if (type[0] === "@") {
    return body;
  }

  if (!printer) {
    throw new Error(`Unsupported node encountered: ${type}\n${JSON.stringify(body, null, 2)}`);
  }

  const printed = printer(path, options, print);

  const { comment } = path.getValue();
  if (comment) {
    return concat([printed, path.call(print, "comment")]);
  }

  return printed;
};

module.exports = genericPrint;
module.exports.nodes = nodes;
