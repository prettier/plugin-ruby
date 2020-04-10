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
});
