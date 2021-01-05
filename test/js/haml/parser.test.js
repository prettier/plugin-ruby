const {
  parse,
  hasPragma,
  locStart,
  locEnd
} = require("../../../src/haml/parser");

describe("parser", () => {
  test("parse", () => {
    expect(parse("= foo").type).toEqual("root");
  });

  test("parse failure", () => {
    expect(() => parse(`%div("invalid ": 1)`)).toThrowError();
  });

  test("hasPragma", () => {
    const withPragma = "-# @prettier";
    const withoutPragma = "-# foo";

    expect(hasPragma(withPragma)).toBe(true);
    expect(hasPragma(withoutPragma)).toBe(false);
  });

  test("locStart", () => {
    expect(locStart({})).toEqual(0);
  });

  test("locEnd", () => {
    expect(locEnd({})).toEqual(0);
  });
});
