import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, hardline, indent, literalline, removeLines, softline, join } =
  prettier;

// If there is some part of this string that matches an escape sequence or that
// contains the interpolation pattern ("#{"), then we are locked into whichever
// quote the user chose. (If they chose single quotes, then double quoting
// would activate the escape sequence, and if they chose double quotes, then
// single quotes would deactivate it.)
function isQuoteLocked(node: Ruby.DynaSymbol | Ruby.StringLiteral) {
  return node.body.some(
    (part) =>
      part.type === "@tstring_content" &&
      (part.body.includes("#{") || part.body.includes("\\"))
  );
}

// A string is considered to be able to use single quotes if it contains only
// plain string content and that content does not contain a single quote.
function isSingleQuotable(node: Ruby.DynaSymbol | Ruby.StringLiteral) {
  return node.body.every(
    (part) => part.type === "@tstring_content" && !part.body.includes("'")
  );
}

const quotePattern = new RegExp("\\\\([\\s\\S])|(['\"])", "g");

function normalizeQuotes(content: string, enclosingQuote: string) {
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

type Quote = keyof typeof quotePairs;

function getClosingQuote(quote: string) {
  if (!quote.startsWith("%")) {
    return quote;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const boundary = /%[Qq]?(.)/.exec(quote)![1];
  if (boundary in quotePairs) {
    return quotePairs[boundary as Quote];
  }

  return boundary;
}

// Prints a @CHAR node. @CHAR nodes are special character strings that usually
// are strings of length 1. If they're any longer than we'll try to apply the
// correct quotes.
export const printChar: Plugin.Printer<Ruby.Char> = (path, opts) => {
  const { body } = path.getValue();

  if (body.length !== 2) {
    return body;
  }

  const quote = opts.rubySingleQuote ? "'" : '"';
  return [quote, body.slice(1), quote];
};

const printPercentSDynaSymbol: Plugin.Printer<Ruby.DynaSymbol> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const parts = [];

  // Push on the quote, which includes the opening character.
  parts.push(node.quote);

  path.each((childPath) => {
    const childNode = childPath.getValue();

    if (childNode.type !== "@tstring_content") {
      // Here we are printing an embedded variable or expression.
      parts.push(print(childPath));
    } else {
      // Here we are printing plain string content.
      parts.push(join(literalline, childNode.body.split("\n")));
    }
  }, "body");

  // Push on the closing character, which is the opposite of the third
  // character from the opening.
  parts.push(quotePairs[node.quote[2] as Quote]);

  return parts;
};

// We don't actually want to print %s symbols, as they're much more rarely seen
// in the wild. But we're going to be forced into it if it's a multi-line symbol
// or if the quoting would get super complicated.
function shouldPrintPercentSDynaSymbol(node: Ruby.DynaSymbol) {
  // We shouldn't print a %s dyna symbol if it was not already that way in the
  // original source.
  if (node.quote[0] !== "%") {
    return false;
  }

  // Here we're going to check if there is a closing character, a new line, or a
  // quote in the content of the dyna symbol. If there is, then quoting could
  // get weird, so just bail out and stick to the original bounds in the source.
  const closing = quotePairs[node.quote[2] as Quote];

  return node.body.some(
    (child) =>
      child.type === "@tstring_content" &&
      (child.body.includes("\n") ||
        child.body.includes(closing) ||
        child.body.includes("'") ||
        child.body.includes('"'))
  );
}

// Prints a dynamic symbol. Assumes there's a quote property attached to the
// node that will tell us which quote to use when printing. We're just going to
// use whatever quote was provided.
//
// In the case of a plain dyna symbol, node.quote will be either :" or :'
// For %s dyna symbols, node.quote will be %s[, %s(, %s{, or %s<
export const printDynaSymbol: Plugin.Printer<Ruby.DynaSymbol> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();

  if (shouldPrintPercentSDynaSymbol(node)) {
    return printPercentSDynaSymbol(path, opts, print);
  }

  const parts = [];
  let quote: string;

  if (isQuoteLocked(node)) {
    if (node.quote.startsWith("%")) {
      quote = opts.rubySingleQuote ? "'" : '"';
    } else if (node.quote.startsWith(":")) {
      quote = node.quote.slice(1);
    } else {
      quote = node.quote;
    }
  } else {
    quote = opts.rubySingleQuote && isSingleQuotable(node) ? "'" : '"';
  }

  parts.push(quote);

  path.each((childPath) => {
    const child = childPath.getValue() as Ruby.StringContent;

    if (child.type !== "@tstring_content") {
      parts.push(print(childPath));
    } else {
      parts.push(
        join(literalline, normalizeQuotes(child.body, quote).split("\n"))
      );
    }
  }, "body");

  parts.push(quote);

  // If we're inside of an assoc_new node as the key, then it will handle
  // printing the : on its own since it could change sides.
  const parentNode = path.getParentNode();
  if (parentNode.type !== "assoc_new" || parentNode.body[0] !== node) {
    parts.unshift(":");
  }

  return parts;
};

export const printStringConcat: Plugin.Printer<Ruby.StringConcat> = (
  path,
  opts,
  print
) => {
  const [leftDoc, rightDoc] = path.map(print, "body");

  return group([leftDoc, " \\", indent([hardline, rightDoc])]);
};

// Prints out an interpolated variable in the string by converting it into an
// embedded expression.
export const printStringDVar: Plugin.Printer<Ruby.StringDVar> = (
  path,
  opts,
  print
) => {
  return ["#{", path.call(print, "body", 0), "}"];
};

export const printStringEmbExpr: Plugin.Printer<Ruby.StringEmbExpr> = (
  path,
  opts,
  print
) => {
  const node = path.getValue();
  const parts = path.call(print, "body", 0);

  // If the contents of this embedded expression were originally on the same
  // line in the source, then we're going to leave them in place and assume
  // that's the way the developer wanted this expression represented.
  if (node.sl === node.el) {
    return ["#{", removeLines(parts), "}"];
  }

  return group(["#{", indent([softline, parts]), [softline, "}"]]);
};

// Prints out a literal string. This function does its best to respect the
// wishes of the user with regards to single versus double quotes, but if the
// string contains any escape expressions then it will just keep the original
// quotes.
export const printStringLiteral: Plugin.Printer<Ruby.StringLiteral> = (
  path,
  { rubySingleQuote },
  print
) => {
  const node = path.getValue();

  // If the string is empty, it will not have any parts, so just print out the
  // quotes corresponding to the config
  if (node.body.length === 0) {
    return rubySingleQuote ? "''" : '""';
  }

  // Determine the quote that should enclose the new string
  let quote: string;
  if (isQuoteLocked(node)) {
    quote = node.quote;
  } else {
    quote = rubySingleQuote && isSingleQuotable(node) ? "'" : '"';
  }

  const parts = path.map((partPath) => {
    const part = partPath.getValue();

    // In this case, the part of the string is an embedded expression
    if (part.type !== "@tstring_content") {
      return print(partPath);
    }

    // In this case, the part of the string is just regular string content
    return join(literalline, normalizeQuotes(part.body, quote).split("\n"));
  }, "body");

  return [quote, ...parts, getClosingQuote(quote)];
};

// Prints out a symbol literal. Its child will always be the ident that
// represents the string content of the symbol.
export const printSymbolLiteral: Plugin.Printer<Ruby.SymbolLiteral> = (
  path,
  opts,
  print
) => {
  return [":", path.call(print, "body", 0)];
};

// Prints out an xstring literal. Its child is an array of string parts,
// including plain string content and interpolated content.
export const printXStringLiteral: Plugin.Printer<Ruby.XStringLiteral> = (
  path,
  opts,
  print
) => {
  return ["`", ...path.map(print, "body"), "`"];
};
