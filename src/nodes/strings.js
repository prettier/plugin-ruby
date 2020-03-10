const {
  concat,
  group,
  hardline,
  indent,
  literalline,
  softline,
  join
} = require("../prettier");

const { concatBody, empty, makeList, prefix, surround } = require("../utils");
const escapePattern = require("../escapePattern");

// If there is some part of this string that matches an escape sequence or that
// contains the interpolation pattern ("#{"), then we are locked into whichever
// quote the user chose. (If they chose single quotes, then double quoting
// would activate the escape sequence, and if they chose double quotes, then
// single quotes would deactivate it.)
const isQuoteLocked = string =>
  string.body.some(
    part =>
      part.type === "@tstring_content" &&
      (escapePattern.test(part.body) || part.body.includes("#{"))
  );

// A string is considered to be able to use single quotes if it contains only
// plain string content and that content does not contain a single quote.
const isSingleQuotable = string =>
  string.body.every(
    part => part.type === "@tstring_content" && !part.body.includes("'")
  );

const quotePattern = new RegExp("\\\\([\\s\\S])|(['\"])", "g");
const quotePairs = {
  '"': '"',
  "'": "'",
  '%{': '}'
};

const makeString = (content, enclosingQuote, originalQuote) => {
  const replaceOther = ["'", '"'].includes(originalQuote);
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `content` with `enclosingQuote`.
  return content.replace(quotePattern, (match, escaped, quote) => {
    if (replaceOther && escaped === otherQuote) {
      return escaped;
    }

    if (quote === enclosingQuote) {
      return `\\${quote}`;
    }

    if (quote) {
      return quote;
    }

    return `\\${escaped}`;
  });
};

// The `parts` argument that comes into this function is an array of either
// printed embedded expressions or plain strings (that themselves can contain
// newlines). What we want to return is an array where each element represents a
// line in the original text. So we end up tracking every line as we go and
// pushing onto a `currentLine` variable, then when we hit a new line we push
// the current line onto the `lines` variable until we've used up every part.
const makeHeredocLines = parts => {
  let lines = [];
  let currentLine = [];

  parts.forEach(part => {
    if (part.type === "group" || !part.includes("\n")) {
      // In this case we've either hit an embedded expression or the piece of
      // the current line that we're looking at is in the middle of two of them,
      // so we just push onto the current line and continue on.
      currentLine.push(part);
      return;
    }

    let splits = part.split("\n");
    if (splits[splits.length - 1] === "") {
      // If a line ends with a newline, then we end up with an empty string at
      // the end of the splits, we just pop it off here since we'll handle the
      // newlines later.
      splits = splits.slice(0, -1);
    }

    if (currentLine.length > 0) {
      lines.push(concat(currentLine.concat(splits[0])));
      currentLine = [];
    } else {
      lines.push(splits[0]);
    }

    if (splits.length > 1) {
      lines = lines.concat(splits.slice(1, -1));
      currentLine.push(splits[splits.length - 1]);
    }
  });

  if (currentLine.length > 0) {
    lines = lines.concat(currentLine);
  }

  return lines;
};

module.exports = {
  "@CHAR": (path, { preferSingleQuotes }, _print) => {
    const { body } = path.getValue();

    if (body.length !== 2) {
      return body;
    }

    const quote = preferSingleQuotes ? "'" : '"';
    return body.length === 2 ? concat([quote, body.slice(1), quote]) : body;
  },
  dyna_symbol: (path, opts, print) => {
    const { quote } = path.getValue();

    return concat([":", quote, concat(path.call(print, "body", 0)), quote]);
  },
  heredoc: (path, opts, print) => {
    const { beging, ending } = path.getValue();
    const lines = makeHeredocLines(path.map(print, "body"));

    return concat([
      beging,
      literalline,
      join(literalline, lines),
      literalline,
      ending
    ]);
  },
  string: makeList,
  string_concat: (path, opts, print) =>
    group(
      concat([
        path.call(print, "body", 0),
        " \\",
        indent(concat([hardline, path.call(print, "body", 1)]))
      ])
    ),
  string_dvar: surround("#{", "}"),
  string_embexpr: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    // If the interpolated expression is inside of an xstring literal (a string
    // that gets sent to the command line) then we don't want to automatically
    // indent, as this can lead to some very odd looking expressions
    if (path.getParentNode().type === "xstring") {
      return concat(["#{", parts, "}"]);
    }

    return group(
      concat(["#{", indent(concat([softline, parts])), concat([softline, "}"])])
    );
  },
  string_literal: (path, { preferSingleQuotes }, print) => {
    const stringLiteral = path.getValue();
    const string = stringLiteral.body[0];

    // If this string is actually a heredoc, bail out and return to the print
    // function for heredocs
    if (string.type === "heredoc") {
      return path.call(print, "body", 0);
    }

    // If the string is empty, it will not have any parts, so just print out the
    // quotes corresponding to the config
    if (string.body.length === 0) {
      return preferSingleQuotes ? "''" : '""';
    }

    // Determine the quote that should enclose the new string
    let quote;
    if (isQuoteLocked(string)) {
      ({ quote } = stringLiteral);
    } else {
      quote = preferSingleQuotes && isSingleQuotable(string) ? "'" : '"';
    }

    const parts = string.body.map((part, index) => {
      if (part.type === "@tstring_content") {
        // In this case, the part of the string is just regular string content
        return makeString(part.body, quote, stringLiteral.quote);
      }
      // In this case, the part of the string is an embedded expression
      return path.call(print, "body", 0, "body", index);
    });

    return concat([quote].concat(parts).concat([quotePairs[quote]]));
  },
  symbol: prefix(":"),
  symbol_literal: concatBody,
  word_add: concatBody,
  word_new: empty,
  xstring: makeList,
  xstring_literal: (path, opts, print) => {
    const parts = path.call(print, "body", 0);

    return concat(["`"].concat(parts).concat("`"));
  }
};
