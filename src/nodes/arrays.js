const { concat, group, ifBreak, indent, join, line, softline } = require("prettier").doc.builders;

const makeArray = start => (path, opts, print) => [start, ...path.map(print, "body")];

const printAref = (path, opts, print) => group(concat([
  path.call(print, "body", 0),
  "[",
  indent(concat([
    softline,
    join(concat([",", line]), path.call(print, "body", 1))
  ])),
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
  array: (path, { trailingComma }, print) => {
    if (path.getValue().body[0] === null) {
      return '[]';
    }

    if (["args", "args_add_star"].includes(path.getValue().body[0].type)) {
      return group(concat([
        "[",
        indent(concat([
          softline,
          join(concat([",", line]), path.call(print, "body", 0)),
          trailingComma ? ifBreak(",", "") : ""
        ])),
        concat([softline, "]"])
      ]));
    }

    const [first, ...rest] = path.call(print, "body", 0);
    return group(concat([
      first,
      "[",
      indent(concat([softline, join(line, rest)])),
      concat([softline, "]"])
    ]));
  },
  qsymbols: makeArray("%i"),
  qwords: makeArray("%w"),
  symbols: makeArray("%I"),
  words: makeArray("%W")
};
