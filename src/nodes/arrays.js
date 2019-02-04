const {
  align, concat, dedent, group, hardline, ifBreak, indent, join, line,
  lineSuffix, literalline, markAsRoot, softline
} = require("prettier").doc.builders;

const concatBody = (path, options, print) => concat(path.map(print, "body"));

const arrays = {
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
  symbols_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "symbols_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  symbols_new: (path, options, print) => group(concat(["%I[", softline])),
  word_add: concatBody,
  word_new: (path, options, print) => "",
  words_add: (path, options, print) => concat([
    path.call(print, "body", 0),
    path.getValue().body[0].type === "words_new" ? "" : line,
    path.call(print, "body", 1)
  ]),
  words_new: (path, options, print) => group(concat(["%W[", softline]))
};

module.exports = arrays;
