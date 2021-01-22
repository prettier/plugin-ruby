const { print } = require("../../../src/ruby/printer");

describe("errors", () => {
  test("invalid ruby", () => expect("<>").toFailFormat());

  test("when encountering an unsupported node type", () => {
    const path = { getValue: () => ({ type: "unsupported", body: {} }) };

    expect(() => print(path)).toThrow("Unsupported");
  });
});
