import { long, ruby } from "../../utils.js";

describe.each(["BEGIN", "END"])("%s hook", (hook) => {
  test("shortens to one line", () => {
    return expect(`${hook} {\n  p "hook"\n}`).toChangeFormat(
      `${hook} { p "hook" }`
    );
  });

  test("maintains single lines", () => {
    return expect(`${hook} { p "hook" }`).toMatchFormat();
  });

  test("maintains multi line", () => {
    return expect(`${hook} {\n  ${long}\n}`).toMatchFormat();
  });

  test("expands to multi line", () => {
    return expect(`${hook} { ${long} }`).toChangeFormat(
      `${hook} {\n  ${long}\n}`
    );
  });

  test("does not move comments on the declaration", () => {
    const content = ruby(`
      ${hook} { # comment
        p "hook"
      }
    `);

    return expect(content).toMatchFormat();
  });

  test("works for comments in the body", () => {
    const content = ruby(`
      ${hook} {
        # this is the comment
      }
    `);

    return expect(content).toMatchFormat();
  });
});
