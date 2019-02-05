const { concat, group, indent, join, line, softline } = require("prettier").doc.builders;
const { append, begin } = require("../utils");

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
