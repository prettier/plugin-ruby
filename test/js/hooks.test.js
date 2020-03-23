const { long } = require("./utils");

describe.each(["BEGIN", "END"])("%s hook", (hook) => {
  test("shortens to one line", () =>
    expect(`${hook} {\n  p 'hook'\n}`).toChangeFormat(`${hook} { p 'hook' }`));

  test("maintains single lines", () =>
    expect(`${hook} { p 'hook' }`).toMatchFormat());

  test("maintains multi line", () =>
    expect(`${hook} {\n  ${long}\n}`).toMatchFormat());

  test("expands to multi line", () =>
    expect(`${hook} { ${long} }`).toChangeFormat(`${hook} {\n  ${long}\n}`));
});
