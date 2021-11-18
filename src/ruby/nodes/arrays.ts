import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";
import { getTrailingComma, printEmptyCollection } from "../../utils";

const { group, ifBreak, indent, join, line, softline } = prettier;

// Checks that every argument within this args node is a string_literal node
// that has no spaces or interpolations. This means we're dealing with an array
// that looks something like:
//
//     ['a', 'b', 'c']
//
function isStringArray(args: Ruby.Args) {
  return (
    args.parts.length > 1 &&
    args.parts.every((arg) => {
      // We want to verify that every node inside of this array is a string
      // literal. We also want to make sure none of them have comments attached.
      if (arg.type !== "string_literal" || arg.comments) {
        return false;
      }

      // If the string has multiple parts (meaning plain string content but also
      // interpolated content) then we know it's not a simple string.
      if (arg.parts.length !== 1) {
        return false;
      }

      const part = arg.parts[0];

      // If the only part of this string is not @tstring_content then it's
      // interpolated, so again we can return false.
      if (part.type !== "tstring_content") {
        return false;
      }

      // Finally, verify that the string doesn't contain a space, an escape
      // character, or brackets so that we know it can be put into a string
      // literal array.
      return !/[\s\\[\]]/.test(part.value);
    })
  );
}

// Checks that every argument within this args node is a symbol_literal node (as
// opposed to a dyna_symbol) so it has no interpolation. This means we're
// dealing with an array that looks something like:
//
//     [:a, :b, :c]
//
function isSymbolArray(args: Ruby.Args) {
  return (
    args.parts.length > 1 &&
    args.parts.every((arg) => arg.type === "symbol_literal" && !arg.comments)
  );
}

// Prints out a word that is a part of a special array literal that accepts
// interpolation. The body is an array of either plain strings or interpolated
// expressions.
export const printWord: Plugin.Printer<Ruby.Word> = (path, opts, print) => {
  return path.map(print, "parts");
};

// Prints out a special array literal. Accepts the parts of the array literal as
// an argument, where the first element of the parts array is a string that
// contains the special start.
function printArrayLiteralParts(start: string, parts: Plugin.Doc[]) {
  return group([
    start,
    "[",
    indent([softline, join(line, parts)]),
    softline,
    "]"
  ]);
}

function printArrayLiteral<T>(start: string): Plugin.Printer<T> {
  return function printArrayLiteralWithStart(path, opts, print) {
    return printArrayLiteralParts(start, (path as any).map(print, "elems"));
  };
}

export const printQsymbols = printArrayLiteral<Ruby.Qsymbols>("%i");
export const printQwords = printArrayLiteral<Ruby.Qwords>("%w");
export const printSymbols = printArrayLiteral<Ruby.Symbols>("%I");
export const printWords = printArrayLiteral<Ruby.Words>("%W");

// An array node is any literal array in Ruby. This includes all of the special
// array literals as well as regular arrays. If it is a special array literal
// then it will have one child that represents the special array, otherwise it
// will have one child that contains all of the elements of the array.
export const printArray: Plugin.Printer<Ruby.Array> = (path, opts, print) => {
  const array = path.getValue();
  const contents = array.cnts;

  // If there is no inner arguments node, then we're dealing with an empty
  // array, so we can go ahead and return.
  if (contents === null) {
    return printEmptyCollection(path, opts, "[", "]");
  }

  if (opts.rubyArrayLiteral) {
    // If we have an array that contains only simple string literals with no
    // spaces or interpolation, then we're going to print a %w array.
    if (isStringArray(contents)) {
      const printString = (stringPath: Plugin.Path<Ruby.StringLiteral>) =>
        stringPath.call(print, "parts", 0);

      const nodePath = path as Plugin.Path<{
        cnts: { parts: Ruby.StringLiteral[] };
      }>;
      const parts = nodePath.map(printString, "cnts", "parts");

      return printArrayLiteralParts("%w", parts);
    }

    // If we have an array that contains only simple symbol literals with no
    // interpolation, then we're going to print a %i array.
    if (isSymbolArray(contents)) {
      const printSymbol = (symbolPath: Plugin.Path<Ruby.SymbolLiteral>) =>
        symbolPath.call(print, "value");

      const nodePath = path as Plugin.Path<{
        cnts: { parts: Ruby.SymbolLiteral[] };
      }>;
      const parts = nodePath.map(printSymbol, "cnts", "parts");

      return printArrayLiteralParts("%i", parts);
    }
  }

  // Here we have a normal array of any type of object with no special literal
  // types or anything.
  return group([
    "[",
    indent([
      softline,
      join([",", line], path.call(print, "cnts")),
      getTrailingComma(opts) ? ifBreak(",", "") : ""
    ]),
    softline,
    "]"
  ]);
};
