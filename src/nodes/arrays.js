const { concat, group, indent, join, line, softline } = require("prettier").doc.builders;
const { append, begin } = require("../utils");

const arrays = {
  array: (path, options, print) => {
    if (path.getValue().body[0] === null) {
      return '[]';
    }

    if (path.getValue().body[0].type === "args_add") {
      return group(concat([
        "[",
        indent(concat([softline, path.call(print, "body", 0)])),
        concat([softline, "]"])
      ]));
    }

    const [first, ...rest] = path.call(print, "body", 0);
    return group(concat([
      first,
      indent(concat([softline, join(line, rest)])),
      concat([softline, "]"])
    ]));
  },
  qsymbols_add: append,
  qsymbols_new: begin("%i["),
  qwords_add: append,
  qwords_new: begin("%w["),
  symbols_add: append,
  symbols_new: begin("%I["),
  words_add: append,
  words_new: begin("%W[")
};

module.exports = arrays;
