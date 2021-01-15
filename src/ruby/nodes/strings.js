const {
  concat,
  group,
  hardline,
  indent,
  literalline,
  removeLines,
  softline,
  join
} = require("../../prettier");

// If there is some part of this string that matches an escape sequence or that
// contains the interpolation pattern ("#{"), then we are locked into whichever
// quote the user chose. (If they chose single quotes, then double quoting
// would activate the escape sequence, and if they chose double quotes, then
// single quotes would deactivate it.)
function isQuoteLocked(node) {
  return node.body.some(
    (part) =>
      part.type === "@tstring_content" &&
      (part.body.includes("#{") || part.body.includes("\\"))
  );
}

// A string is considered to be able to use single quotes if it contains only
// plain string content and that content does not contain a single quote.
function isSingleQuotable(node) {
  return node.body.every(
    (part) => part.type === "@tstring_content" && !part.body.includes("'")
  );
}

const quotePattern = new RegExp("\\\\([\\s\\S])|(['\"])", "g");

function normalizeQuotes(content, enclosingQuote) {
  // Escape and unescape single and double quotes as needed to be able to
  // enclose `content` with `enclosingQuote`.
  return content.replace(quotePattern, (match, escaped, quote) => {
    if (quote === enclosingQuote) {
      return `\\${quote}`;
    }

    if (quote) {
      return quote;
    }

    return `\\${escaped}`;
  });
}

const quotePairs = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">"
};

function getClosingQuote(quote) {
  if (!quote.startsWith("%")) {
    return quote;
  }

  const boundary = /%[Qq]?(.)/.exec(quote)[1];
  if (boundary in quotePairs) {
    return quotePairs[boundary];
  }

  return boundary;
}

// Prints a @CHAR node. @CHAR nodes are special character strings that usually
// are strings of length 1. If they're any longer than we'll try to apply the
// correct quotes.
function printChar(path, { rubySingleQuote }, _print) {
  const { body } = path.getValue();

  if (body.length !== 2) {
    return body;
  }

  const quote = rubySingleQuote ? "'" : '"';
  return concat([quote, body.slice(1), quote]);
}

// Prints a dynamic symbol. Assumes there's a quote property attached to the
// node that will tell us which quote to use when printing. We're just going to
// use whatever quote was provided.
function printDynaSymbol(path, opts, print) {
  const { quote } = path.getValue();

  return concat([":", quote].concat(path.map(print, "body")).concat(quote));
}

function printStringConcat(path, opts, print) {
  const [leftDoc, rightDoc] = path.map(print, "body");

  return group(concat([leftDoc, " \\", indent(concat([hardline, rightDoc]))]));
}

// Prints out an interpolated variable in the string by converting it into an
// embedded expression.
function printStringDVar(path, opts, print) {
  return concat(["#{", path.call(print, "body", 0), "}"]);
}

function printStringEmbExpr(path, opts, print) {
  const node = path.getValue();
  const parts = path.call(print, "body", 0);

  // If the contents of this embedded expression were originally on the same
  // line in the source, then we're going to leave them in place and assume
  // that's the way the developer wanted this expression represented.
  if (node.sl === node.el) {
    return concat(["#{", removeLines(parts), "}"]);
  }

  return group(
    concat(["#{", indent(concat([softline, parts])), concat([softline, "}"])])
  );
}

// Prints out a literal string. This function does its best to respect the
// wishes of the user with regards to single versus double quotes, but if the
// string contains any escape expressions then it will just keep the original
// quotes.
function printStringLiteral(path, { rubySingleQuote }, print) {
  const node = path.getValue();

  // If the string is empty, it will not have any parts, so just print out the
  // quotes corresponding to the config
  if (node.body.length === 0) {
    return rubySingleQuote ? "''" : '""';
  }

  // Determine the quote that should enclose the new string
  let quote;
  if (isQuoteLocked(node)) {
    quote = node.quote;
  } else {
    quote = rubySingleQuote && isSingleQuotable(node) ? "'" : '"';
  }

  const parts = node.body.map((part, index) => {
    if (part.type !== "@tstring_content") {
      // In this case, the part of the string is an embedded expression
      return path.call(print, "body", index);
    }

    // In this case, the part of the string is just regular string content
    return join(literalline, normalizeQuotes(part.body, quote).split("\n"));
  });

  return concat([quote].concat(parts).concat(getClosingQuote(quote)));
}

// Prints out a symbol literal. Its child will always be the ident that
// represents the string content of the symbol.
function printSymbolLiteral(path, opts, print) {
  return concat([":", path.call(print, "body", 0)]);
}

// Prints out an xstring literal. Its child is an array of string parts,
// including plain string content and interpolated content.
function printXStringLiteral(path, opts, print) {
  return concat(["`"].concat(path.map(print, "body")).concat("`"));
}

module.exports = {
  "@CHAR": printChar,
  dyna_symbol: printDynaSymbol,
  string_concat: printStringConcat,
  string_dvar: printStringDVar,
  string_embexpr: printStringEmbExpr,
  string_literal: printStringLiteral,
  symbol_literal: printSymbolLiteral,
  xstring_literal: printXStringLiteral
};
