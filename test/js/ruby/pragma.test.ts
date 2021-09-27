import parser from "../../../src/ruby/parser";
import printer from "../../../src/ruby/printer";
import { ruby } from "../utils";

describe("pragma", () => {
  describe("hasPragma", () => {
    test("checks for @prettier comments", () => {
      expect(parser.hasPragma("# @prettier")).toBe(true);
    });

    test("checks for @format comments", () => {
      expect(parser.hasPragma("# @format")).toBe(true);
    });

    test("does not check for anything else", () => {
      expect(parser.hasPragma("# @foobar")).toBe(false);
    });

    test("works when the comment is not on the first line", () => {
      const content = ruby(`
        # typed: true
        # @format
      `);

      expect(parser.hasPragma(content)).toBe(true);
    });
  });

  describe("insertPragma", () => {
    test("inserts normally", () => {
      const content = "foo + bar";

      expect(printer.insertPragma(content)).toEqual(`# @format\n\n${content}`);
    });

    test("inserts when there is already a comment at the top", () => {
      const content = ruby(`
        # frozen_string_literal: true

        foo
      `);

      expect(printer.insertPragma(content)).toEqual(`# @format\n${content}`);
    });
  });
});
