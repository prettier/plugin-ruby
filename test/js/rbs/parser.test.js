const { ruby } = require("../utils");
const {
  parse,
  hasPragma,
  locStart,
  locEnd
} = require("../../../src/rbs/parser");

describe("parser", () => {
  test("parse", () => {
    expect(parse("class Foo end", [], {}).declarations).toHaveLength(1);
  });

  test("parse failure", () => {
    expect(() => parse("<>", [], {})).toThrowError();
  });

  test("hasPragma", () => {
    const withPragma = ruby(`
      # @prettier
      module Foo
      end
    `);

    const withoutPragma = ruby(`
      module Foo
      end
    `);

    expect(hasPragma(withPragma)).toBe(true);
    expect(hasPragma(withoutPragma)).toBe(false);
  });

  test("locStart", () => {
    expect(locStart({ location: { start_pos: 5 } })).toEqual(5);
    expect(locStart({ type: { location: { start_pos: 10 } } })).toEqual(10);
  });

  test("locEnd", () => {
    expect(locEnd({ location: { end_pos: 5 } })).toEqual(5);
    expect(locEnd({ type: { location: { end_pos: 10 } } })).toEqual(10);
  });
});
