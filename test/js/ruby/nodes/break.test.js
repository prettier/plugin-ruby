import { ruby } from "../../utils.js";

describe("break", () => {
  test("empty break", () => {
    return expect("break").toMatchFormat();
  });

  test("break with one argument, no parens", () => {
    return expect("break 1").toMatchFormat();
  });

  test("break with parens drops parens", () => {
    return expect("break(1)").toChangeFormat("break 1");
  });

  test("break with multiple arguments", () => {
    return expect("break 1, 2, 3").toMatchFormat();
  });

  test("keeps parens for multiple statements", () => {
    const expected = ruby(`
      break(
        a = 1
        a == 1
      )
    `);

    return expect("break(a = 1; a == 1)").toChangeFormat(expected);
  });

  test("keeps parens for _mod nodes", () => {
    return expect("break(1 if true)").toMatchFormat();
  });

  test("works with comments", () => {
    return expect("break # foo").toMatchFormat();
  });
});
