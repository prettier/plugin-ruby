const { long, ruby } = require("./utils");

describe("undef", () => {
  test("single inline", () => expect("undef foo").toMatchFormat());

  test("multiple inline", () => expect("undef foo, bar").toMatchFormat());

  test("multiple breaking", () => {
    const expected = ruby(`
      undef ${long},
            a${long}
    `);

    return expect(`undef ${long}, a${long}`).toChangeFormat(expected);
  });

  test("single with comment", () => expect("undef foo # bar").toMatchFormat());

  test("multiple inline with comment", () => expect("undef foo, bar # baz").toMatchFormat());

  test("multiple lines comment on first", () => {
    return expect(ruby(`
      undef foo, # baz
            bar
    `)).toMatchFormat();
  });

  test("multiple lines comment on each", () => {
    return expect(ruby(`
      undef foo, # baz
            bar # bam
    `)).toMatchFormat();
  });

  test("multiple breaking with comment", () => {
    const expected = ruby(`
      undef ${long},
            a${long} # foo
    `);

    return expect(`undef ${long}, a${long} # foo`).toChangeFormat(expected);
  });
});
