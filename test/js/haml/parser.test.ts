import type { HAML, Plugin } from "../../../src/types";
import parser from "../../../src/haml/parser";

describe("parser", () => {
  test("parse", () => {
    expect(parser.parse("= foo", {}, {} as Plugin.Options).type).toEqual(
      "root"
    );
  });

  test("parse failure", () => {
    expect(() =>
      parser.parse(`%div("invalid ": 1)`, {}, {} as Plugin.Options)
    ).toThrowError();
  });

  test("hasPragma", () => {
    const withPragma = "-# @prettier";
    const withoutPragma = "-# foo";

    expect(parser.hasPragma(withPragma)).toBe(true);
    expect(parser.hasPragma(withoutPragma)).toBe(false);
  });

  test("locStart", () => {
    expect(parser.locStart({} as HAML.AnyNode)).toEqual(0);
  });

  test("locEnd", () => {
    expect(parser.locEnd({} as HAML.AnyNode)).toEqual(0);
  });
});
