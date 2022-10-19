import { long, ruby } from "../../utils.js";

describe("undef", () => {
  test("single inline", () => {
    return expect("undef foo").toMatchFormat();
  });

  test("multiple inline", () => {
    return expect("undef foo, bar").toMatchFormat();
  });

  test("multiple breaking", () => {
    const expected = ruby(`
      undef ${long},
            a${long}
    `);

    return expect(`undef ${long}, a${long}`).toChangeFormat(expected);
  });

  test("single with comment", () => {
    return expect("undef foo # bar").toMatchFormat();
  });

  test("multiple inline with comment", () => {
    return expect("undef foo, bar # baz").toMatchFormat();
  });

  test("multiple lines comment on first", () => {
    const content = ruby(`
      undef foo, # baz
            bar
    `);

    return expect(content).toMatchFormat();
  });

  test("multiple lines comment on each", () => {
    const content = ruby(`
      undef foo, # baz
            bar # bam
    `);

    return expect(content).toMatchFormat();
  });

  test("multiple breaking with comment", () => {
    const expected = ruby(`
      undef ${long},
            a${long} # foo
    `);

    return expect(`undef ${long}, a${long} # foo`).toChangeFormat(expected);
  });
});
