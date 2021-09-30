import { long, ruby } from "../../utils";

describe.each(["BEGIN", "END"])("%s hook", (hook) => {
  test("shortens to one line", () => {
    expect(`${hook} {\n  p 'hook'\n}`).toChangeFormat(`${hook} { p 'hook' }`);
  });

  test("maintains single lines", () => {
    expect(`${hook} { p 'hook' }`).toMatchFormat();
  });

  test("maintains multi line", () => {
    expect(`${hook} {\n  ${long}\n}`).toMatchFormat();
  });

  test("expands to multi line", () => {
    expect(`${hook} { ${long} }`).toChangeFormat(`${hook} {\n  ${long}\n}`);
  });

  test("does not move comments on the declaration", () => {
    const content = ruby(`
      ${hook} { # comment
        p 'hook'
      }
    `);

    expect(content).toMatchFormat();
  });

  test("works for comments in the body", () => {
    const content = ruby(`
      ${hook} {
        # this is the comment
      }
    `);

    expect(content).toMatchFormat();
  });
});
