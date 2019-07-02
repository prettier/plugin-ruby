const { ruby } = require("../../src/ruby").parsers;

describe("locations", () => {
  test("locStart and locEnd are defined", () => {
    const { hasOwnProperty } = Object.prototype;

    expect(hasOwnProperty.call(ruby, "locStart")).toBe(true);
    expect(hasOwnProperty.call(ruby, "locEnd")).toBe(true);
  });
});
