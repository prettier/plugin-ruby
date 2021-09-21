import type { Plugin, RBS } from "../../../src/types";
import { ruby } from "../utils";
import parser from "../../../src/rbs/parser";

describe("parser", () => {
  test("parse", () => {
    expect(
      parser.parse("class Foo end", {}, {} as Plugin.Options).declarations
    ).toHaveLength(1);
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
    const node = { location: { start_pos: 5 } } as RBS.AnyNode;

    expect(parser.locStart(node)).toEqual(5);
  });

  test("locEnd", () => {
    const node = { location: { end_pos: 5 } } as RBS.AnyNode;

    expect(parser.locEnd(node)).toEqual(5);
  });
});
