import type { Plugin, RBS } from "../../../src/types";
import { ruby } from "../utils";
import parser from "../../../src/rbs/parser";

describe("parser", () => {
  test("parse", () => {
    expect(parser.parse("class Foo end", {}, {} as Plugin.Options).declarations).toHaveLength(1);
  });

  test("parse failure", () => {
    expect(() => parser.parse("<>", {}, {} as Plugin.Options)).toThrowError();
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

    expect(parser.hasPragma(withPragma)).toBe(true);
    expect(parser.hasPragma(withoutPragma)).toBe(false);
  });

  test("locStart", () => {
    expect(parser.locStart({ location: { start_pos: 5 } } as RBS.AnyNode)).toEqual(5);
    expect(parser.locStart({ type: { location: { start_pos: 10 } } } as RBS.AnyNode)).toEqual(10);
  });

  test("locEnd", () => {
    expect(parser.locEnd({ location: { end_pos: 5 } } as RBS.AnyNode)).toEqual(5);
    expect(parser.locEnd({ type: { location: { end_pos: 10 } } } as RBS.AnyNode)).toEqual(10);
  });
});
