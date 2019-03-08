const { concat, group, ifBreak, indent, join, line, softline } = require("prettier").doc.builders;

const isStringArray = args => args.body.every(arg => (
  arg.type === "string_literal"
  && arg.body[0].body.length === 1
  && arg.body[0].body[0].type === "@tstring_content"
  && !arg.body[0].body[0].body.includes(" ")
));

const isSymbolArray = args => args.body.every(arg => (
  arg.type === "symbol_literal"
));

const makeArray = start => (path, opts, print) => (
  [start].concat(path.map(print, "body"))
);

const getSpecialArrayParts = (path, print, args) => args.body.map((_arg, index) => (
  path.call(print, "body", 0, "body", index, "body", 0, "body", 0)
));

const printAref = (path, opts, print) => group(concat([
  path.call(print, "body", 0),
  "[",
  indent(concat([
    softline,
    join(concat([",", line]), path.call(print, "body", 1))
  ])),
  concat([softline, "]"])
]));

const printSpecialArray = parts => group(concat([
  parts[0],
  "[",
  indent(concat([softline, join(line, parts.slice(1))])),
  concat([softline, "]"])
]));

module.exports = {
  aref: (path, opts, print) => {
    if (!path.getValue().body[1]) {
      return concat([path.call(print, "body", 0), "[]"]);
    }

    return printAref(path, opts, print);
  },
  aref_field: printAref,
  array: (path, { addTrailingCommas }, print) => {
    const args = path.getValue().body[0];

    if (args === null) {
      return "[]";
    }

    if (isStringArray(args)) {
      return printSpecialArray(["%w"].concat(getSpecialArrayParts(path, print, args)));
    }

    if (isSymbolArray(args)) {
      return printSpecialArray(["%i"].concat(getSpecialArrayParts(path, print, args)));
    }

    if (["args", "args_add_star"].includes(args.type)) {
      return group(concat([
        "[",
        indent(concat([
          softline,
          join(concat([",", line]), path.call(print, "body", 0)),
          addTrailingCommas ? ifBreak(",", "") : ""
        ])),
        concat([softline, "]"])
      ]));
    }

    return printSpecialArray(path.call(print, "body", 0));
  },
  qsymbols: makeArray("%i"),
  qwords: makeArray("%w"),
  symbols: makeArray("%I"),
  words: makeArray("%W")
};
