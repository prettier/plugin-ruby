import { long } from "../../utils.js";

describe("defined", () => {
  test("no parens", () => {
    return expect("defined? a").toChangeFormat("defined?(a)");
  });

  test("parens", () => {
    return expect("defined?(a)").toMatchFormat();
  });

  test("breaks on long identifier, no parens", () => {
    return expect(`defined? ${long}`).toChangeFormat(`defined?(\n  ${long}\n)`);
  });

  test("breaks on long identifier, with parens", () => {
    return expect(`defined?(${long})`).toChangeFormat(
      `defined?(\n  ${long}\n)`
    );
  });

  test("breaking keeps breaking", () => {
    return expect(`defined?(\n  ${long}\n)`).toMatchFormat();
  });

  test("unnecessary breaking reverts to inline", () => {
    return expect("defined?(\n  a\n)").toChangeFormat("defined?(a)");
  });
});
