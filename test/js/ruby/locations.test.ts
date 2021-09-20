import parser from "../../../src/ruby/parser";

describe("locations", () => {
  test("locStart and locEnd are defined", () => {
    const { hasOwnProperty } = Object.prototype;

    expect(hasOwnProperty.call(parser, "locStart")).toBe(true);
    expect(hasOwnProperty.call(parser, "locEnd")).toBe(true);
  });
});
