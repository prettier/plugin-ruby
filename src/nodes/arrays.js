const { concat, group, indent, join, line, softline } = require("prettier").doc.builders;

const makeArray = start => (path, opts, print) => [start, ...path.map(print, "body")];

module.exports = {
  array: (path, opts, print) => {
    if (path.getValue().body[0] === null) {
      return '[]';
    }

    if (["args_add", "args_add_star"].includes(path.getValue().body[0].type)) {
      return group(concat([
        "[",
        indent(concat([softline, path.call(print, "body", 0)])),
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
