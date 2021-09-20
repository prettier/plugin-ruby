import parser from "../../../src/ruby/parser";

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
});
