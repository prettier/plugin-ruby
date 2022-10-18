import { ruby } from "../../utils.js";

describe("next", () => {
  test("bare", () => {
    return expect("next").toMatchFormat();
  });

  test("one arg, no parens", () => {
    return expect("next 1").toMatchFormat();
  });

  test("one arg, with parens", () => {
    return expect("next(1)").toChangeFormat("next 1");
  });

  test("multiple args", () => {
    return expect("next 1, 2").toMatchFormat();
  });

  test("keeps parens for multiple statements", () => {
    const expected = ruby(`
      next(
        a = 1
        a == 1
      )
    `);

    return expect("next(a = 1; a == 1)").toChangeFormat(expected);
  });

  test("keeps parens for _mod nodes", () => {
    return expect("next(1 if true)").toMatchFormat();
  });
});
