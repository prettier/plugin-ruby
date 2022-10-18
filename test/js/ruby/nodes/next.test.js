import { ruby } from "../../utils.js";

describe("next", () => {
  test("bare", () => {
    expect("next").toMatchFormat();
  });

  test("one arg, no parens", () => {
    expect("next 1").toMatchFormat();
  });

  test("one arg, with parens", () => {
    expect("next(1)").toChangeFormat("next 1");
  });

  test("multiple args", () => {
    expect("next 1, 2").toMatchFormat();
  });

  test("keeps parens for multiple statements", () => {
    const expected = ruby(`
      next(
        a = 1
        a == 1
      )
    `);

    expect("next(a = 1; a == 1)").toChangeFormat(expected);
  });

  test("keeps parens for _mod nodes", () => {
    expect("next(1 if true)").toMatchFormat();
  });
});
