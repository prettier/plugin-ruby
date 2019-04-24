const { long } = require("./utils");

describe("binary", () => {
  test("single line", () => expect("foo && bar && baz").toMatchFormat());

  test("multi line", () =>
    expect(`${long} && ${long} && ${long}`).toChangeFormat(
      `${long} &&\n  ${long} &&\n  ${long}`
    ));
});
