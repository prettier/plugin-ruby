const { ruby } = require("../utils");

describe("haml comment", () => {
  test("same line", () => {
    expect("-# comment").toMatchHamlFormat();
  });

  test("multi line", () => {
    const content = ruby(`
      -#
        this is
          a multi line
        comment
    `);

    expect(content).toMatchHamlFormat();
  });

  test("weird spacing same line", () => {
    expect("-#      foobar     ").toChangeHamlFormat("-# foobar");
  });
});
