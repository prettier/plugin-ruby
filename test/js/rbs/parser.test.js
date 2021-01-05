const { ruby } = require("../utils");
const {
  parse,
  hasPragma,
  locStart,
  locEnd
} = require("../../../src/rbs/parser");

describe("printer", () => {
  if (process.env.RUBY_VERSION <= "3.0") {
    test("RBS did not exist before ruby 3.0", () => {
      // this is here because test files must contain at least one test, so for
      // earlier versions of ruby this is just going to chill here
    });

    return;
  }

  test("parse", () => {
    expect(parse("class Foo end").declarations).toHaveLength(1);
  });

  test("parse", () => {
    expect(() => parse("<>")).toThrowError();
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
