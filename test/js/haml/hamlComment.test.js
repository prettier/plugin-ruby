import { haml } from "../utils";

describe("haml comment", () => {
  test("empty", () => {
    return expect(haml("-#")).toMatchFormat();
  });

  test("same line", () => {
    return expect(haml("-# comment")).toMatchFormat();
  });

  test("multi line", () => {
    const content = haml(`
      -#
        this is
          a multi line
        comment
    `);

    return expect(content).toMatchFormat();
  });

  test("weird spacing same line", () => {
    return expect(haml("-#     foobar    ")).toChangeFormat("-# foobar");
  });
});
