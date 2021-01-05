const { haml } = require("../utils");

describe("haml comment", () => {
  test("empty", () => expect(haml("-#")).toMatchFormat());

  test("same line", () => expect(haml("-# comment")).toMatchFormat());

  test("multi line", () => {
    const content = haml(`
      -#
        this is
          a multi line
        comment
    `);

    return expect(content).toMatchFormat();
  });

  test("weird spacing same line", () =>
    expect(haml("-#     foobar    ")).toChangeFormat("-# foobar"));
});
