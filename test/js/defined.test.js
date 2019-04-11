const { long } = require("./utils");

describe("defined", () => {
  test("no parens", () => {
    expect("defined? a").toChangeFormat("defined?(a)");
  });

  test("parens", () => {
    expect("defined?(a)").toMatchFormat();
  });

  test("breaks on long identifier, no parens", () => {
    expect(`defined? ${long}`).toChangeFormat(`defined?(\n  ${long}\n)`);
  });

  test("breaks on long identifier, with parens", () => {
    expect(`defined?(${long})`).toChangeFormat(`defined?(\n  ${long}\n)`);
  });

  test("breaking keeps breaking", () => {
    expect(`defined?(\n  ${long}\n)`).toMatchFormat();
  });

  test("unnecessary breaking reverts to inline", () => {
    expect("defined?(\n  a\n)").toChangeFormat("defined?(a)");
  });
});
