import type { Plugin, Ruby } from "../../types";

// An @int node is any literal integer in Ruby. They can come in a number of
// bases, and look like the following:
//
// Binary (2)       - 0b0110
// Octal (8)        - 0o34 or 034
// Decimal (10)     - a normal number like 159
// Hexidecimal (16) - 0xac5
//
// If it's a decimal number, it can be optional separated by any number of
// arbitrarily places underscores. This can be useful for dollars and cents
// (34_99), dates (2020_11_30), and normal 3 digit separation (1_222_333).
export const printInt: Plugin.Printer<Ruby.Int> = (path) => {
  const { body } = path.getValue();

  // If the number is a base 10 number, is sufficiently large, and is not
  // already formatted with underscores, then add them in in between the
  // numbers every three characters starting from the right.
  if (!body.startsWith("0") && body.length >= 5 && !body.includes("_")) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const segments = `  ${body}`.slice((body.length + 2) % 3).match(/.{3}/g)!;
    return segments.join("_").trim();
  }

  return body;
};
