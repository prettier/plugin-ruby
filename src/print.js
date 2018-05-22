const {
  align, concat, dedent, group, hardline, ifBreak, indent, join, line, literalline, markAsRoot, softline
} = require("prettier").doc.builders;

const concatBody = (path, print) => concat(path.map(print, "body"));

const nodes = {
  alias: (path, print) => concat(["alias ", join(" ", path.map(print, "body"))]),
  aref: (path, print) => concat([
    path.call(print, "body", 0),
    "[",
    path.call(print, "body", 1),
    "]"
  ]),
  arg_paren: (path, print) => group(concat(["(", concat(path.map(print, "body")), ")"])),
  args_add_block: (path, print) => {
    const [_, block] = path.getValue().body;
    const parts = [join(", ", path.map(print, "body", 0))];

    if (block) {
      parts.push("&", path.call(print, "body", 1));
    }

    return group(concat(parts));
  },
  array: (path, print) => {
    if (path.getValue().body[0].every(({ type }) => type === "@tstring_content")) {
      return group(concat([
        "%w[",
        softline,
        indent(join(line, path.map(print, "body", 0))),
        softline,
        "]"
      ]))
    }

    return group(concat([
      "[",
      softline,
      indent(concat([join(concat([",", line]), path.map(print, "body", 0))])),
      softline,
      "]"
    ]));
  },
  assign: (path, print) => join(" = ", path.map(print, "body")),
  begin: (path, print) => group(concat([
    "begin",
    indent(concat([hardline, concat(path.map(print, "body"))])),
    group(concat([hardline, "end"]))
  ])),
  binary: (path, print) => join(` ${path.getValue().body[1]} `, [
    path.call(print, "body", 0),
    path.call(print, "body", 2)
  ]),
  block_var: (path, print) => concat(["|", path.call(print, "body", 0), "| "]),
  bodystmt: (path, print) => {
    const [statements, ...additions] = path.getValue().body;
    const parts = [join(hardline, path.map(print, "body", 0))];

    additions.forEach((addition, index) => {
      if (addition) {
        parts.push(dedent(concat([
          hardline,
          path.call(print, "body", index + 1)
        ])));
      }
    });

    return group(concat(parts));
  },
  brace_block: (path, print) => concat([
    "{ ",
    path.call(print, "body", 0),
    concat(path.map(print, "body", 1)),
    " }"
  ]),
  break: (path, print) => {
    if (path.getValue().body[0].length > 0) {
      return concat(["break ", path.call(print, "body", 0)]);
    }
    return "break";
  },
  call: (path, print) => join(path.getValue().body[1], [
    path.call(print, "body", 0),
    path.call(print, "body", 2)
  ]),
  case: (path, print) => group(concat([
    group(concat(["case ", path.call(print, "body", 0)])),
    group(concat([hardline, path.call(print, "body", 1)])),
    group(concat([hardline, "end"]))
  ])),
  class: (path, print) => {
    const [_constant, superclass, _statements] = path.getValue().body;
    const parts = ["class ", path.call(print, "body", 0)];

    if (superclass) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    return group(concat([
      group(concat(parts)),
      indent(concat([hardline, path.call(print, "body", 2)])),
      group(concat([hardline, "end"])),
      literalline
    ]));
  },
  command: (path, print) => join(" ", path.map(print, "body")),
  const_path_ref: (path, print) => join("::", path.map(print, "body")),
  const_ref: (path, print) => path.call(print, "body", 0),
  def: (path, print) => concat([
    group(concat([hardline, "def ", path.call(print, "body", 0), path.call(print, "body", 1)])),
    indent(concat([hardline, path.call(print, "body", 2)])),
    group(concat([hardline, "end"]))
  ]),
  defined: (path, print) => group(concat([
    "defined?(",
    softline,
    indent(concat(path.map(print, "body"))),
    softline,
    ")"
  ])),
  do_block: (path, print) => concat([
    "do ",
    path.call(print, "body", 0),
    indent(concat([hardline, path.call(print, "body", 1)])),
    group(concat([hardline, "end"]))
  ]),
  dot2: (path, print) => concat([
    path.call(print, "body", 0),
    "..",
    path.call(print, "body", 1)
  ]),
  dot3: (path, print) => concat([
    path.call(print, "body", 0),
    "...",
    path.call(print, "body", 1)
  ]),
  else: (path, print) => group(concat([
    "else",
    indent(concat([hardline, concat(path.map(print, "body", 0))]))
  ])),
  elsif: (path, print) => {
    const [_predicate, _statements, addition] = path.getValue().body;
    const parts = [
      group(concat(["elsif ", path.call(print, "body", 0)])),
      indent(concat([hardline, concat(path.map(print, "body", 1))]))
    ];

    if (addition) {
      parts.push(group(concat([hardline, path.call(print, "body", 2)])));
    }

    return group(concat(parts));
  },
  ensure: (path, print) => group(concat([
    "ensure",
    indent(concat([hardline, concat(path.map(print, "body", 0))
  ]))])),
  fcall: concatBody,
  if: (path, print) => {
    const [_predicate, _statements, addition] = path.getValue().body;
    const parts = [
      group(concat(["if ", path.call(print, "body", 0)])),
      indent(concat([hardline, concat(path.map(print, "body", 1))])),
      hardline
    ];

    if (addition) {
      parts.push(group(concat([path.call(print, "body", 2), hardline])));
    }

    parts.push("end");
    return group(concat(parts));
  },
  massign: (path, print) => concat([
    group(join(concat([",", line]), path.map(print, "body", 0))),
    " = ",
    path.call(print, "body", 1)
  ]),
  method_add_arg: concatBody,
  method_add_block: (path, print) => join(" ", path.map(print, "body")),
  module: (path, print) => concat([
    group(concat(["module ", path.call(print, "body", 0)])),
    indent(path.call(print, "body", 1)),
    dedent(concat(["end", literalline]))
  ]),
  next: (path, print) => {
    if (path.getValue().body.length > 0) {
      return concat(["next ", path.call(print, "body", 0)]);
    }
    return "next";
  },
  params: (path, print) => {
    const [req, opt, ...rest] = path.getValue().body;
    let parts = [];

    if (req) {
      parts = parts.concat(path.map(print, "body", 0));
    }

    if (opt) {
      parts = parts.concat(opt.map((name, index) => {
        return concat([
          path.call(print, "body", 1, index, 0),
          " = ",
          path.call(print, "body", 1, index, 1)
        ]);
      }));
    }

    return join(", ", parts);
  },
  paren: (path, print) => (
    concat(["(", concat(path.getValue().body.reduce((parts, part, index) => {
      if (Array.isArray(part)) {
        return parts.concat(path.map(print, "body", index));
      }
      return [...parts, path.call(print, "body", index)];
    }, [])), ")"])
  ),
  program: (path, print) => markAsRoot(concat([
    join(literalline, path.map(print, "body", 0)),
    literalline
  ])),
  redo: (path, print) => "redo",
  regexp_literal: (path, print) => {
    const delim = path.call(print, "body", 1);

    return group(concat([
      delim,
      group(concat(path.map(print, "body", 0))),
      delim
    ]));
  },
  rescue: (path, print) => {
    const [exception, variable, _statements, _2] = path.getValue().body;
    const parts = ["rescue"];

    if (exception) {
      parts.push(group(concat([" ", join(", ", path.map(print, "body", 0))])));
    }

    if (variable) {
      parts.push(group(concat([" => ", path.call(print, "body", 1)])));
    }

    parts.push(indent(concat([hardline, concat(path.map(print, "body", 2))])));

    return group(concat(parts));
  },
  retry: (path, print) => "retry",
  return: (path, print) => group(concat(["return ", concat(path.map(print, "body"))])),
  return0: (path, print) => "return",
  sclass: (path, print) => group(concat([
    group(concat([hardline, "class << ", path.call(print, "body", 0)])),
    indent(path.call(print, "body", 1)),
    concat([hardline, "end"])
  ])),
  string_concat: (path, print) => group(concat([
    path.call(print, "body", 0),
    " \\",
    indent(concat([line, path.call(print, "body", 1)]))
  ])),
  string_content: (path, print) => {
    const delim = path.getValue().body.some(({ type }) => type === "string_embexpr") ? "\"" : "'";
    return concat([delim, concat(path.map(print, "body")), delim]);
  },
  string_embexpr: (path, print) => concat(["#{", concat(path.map(print, "body", 0)), "}"]),
  string_literal: concatBody,
  super: concatBody,
  symbol: (path, print) => concat([":", concat(path.map(print, "body"))]),
  symbol_literal: concatBody,
  unary: (path, print) => concat([
    path.getValue().body[0][0],
    path.call(print, "body", 1)
  ]),
  undef: (path, print) => concat(["undef ", concat(path.map(print, "body", 0))]),
  unless: (path, print) => concat([
    group(concat(["unless ", path.call(print, "body", 0)])),
    indent(concat([hardline, concat(path.map(print, "body", 1))])),
    group(concat([hardline, "end"]))
  ]),
  until: (path, print) => group(concat([
    group(concat(["until ", path.call(print, "body", 0)])),
    indent(concat([hardline, concat(path.map(print, "body", 1))])),
    group(concat([hardline, "end"]))
  ])),
  var_field: concatBody,
  var_ref: (path, print) => path.call(print, "body", 0),
  vcall: concatBody,
  void_stmt: (path, print) => "",
  when: (path, print) => {
    const [_predicates, _statements, addition] = path.getValue().body;
    const parts = [
      group(concat(["when ", join(", ", path.map(print, "body", 0))])),
      indent(concat([hardline, concat(path.map(print, "body", 1))]))
    ];

    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 2)]));
    }

    return group(concat(parts));
  },
  while: (path, print) => group(concat([
    group(concat(["while ", path.call(print, "body", 0)])),
    indent(concat([hardline, concat(path.map(print, "body", 1))])),
    group(concat([hardline, "end"]))
  ])),
  yield: (path, print) => concat([
    "yield ",
    concat(path.map(print, "body"))
  ]),
  yield0: (path, print) => "yield",
  zsuper: (path, print) => concat([
    "super",
    concat(path.map(print, "body"))
  ])
};

const debugNode = (path, print) => {
  console.log("=== UNSUPPORTED NODE ===");
  console.log(path.getValue());
  console.log("========================");
  return "";
};

const genericPrint = (path, options, print) => {
  const { type } = path.getValue();

  if (type[0] === "@") {
    return path.getValue().body;
  }

  return (nodes[type] || debugNode)(path, print);
};

module.exports = genericPrint;
