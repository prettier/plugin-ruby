const { long, ruby } = require("./utils");

describe("super", () => {
  test("bare", () => expect("super").toMatchFormat());

  test("empty parens", () => expect("super()").toMatchFormat());

  test("one arg, no parens", () => expect("super 1").toMatchFormat());

  test("one arg, with parens", () => expect("super(1)").toMatchFormat());

  test("multiple args, no parens", () => expect("super 1, 2").toMatchFormat());

  test("multiple args, with parens", () =>
    expect("super(1, 2)").toMatchFormat());

  test("multiple args, breaking", () => {
    const expected = ruby(`
      super ${long},
            a${long}
    `);

    return expect(`super ${long}, a${long}`).toChangeFormat(expected);
  });

  describe("with comment", () => {
    test("bare", () => expect("super # comment").toMatchFormat());

    test("empty parens", () => expect("super() # comment").toMatchFormat());

    test("one arg, no parens", () =>
      expect("super 1 # comment").toMatchFormat());

    test("one arg, with parens", () =>
      expect("super(1) # comment").toMatchFormat());

    test("multiple args, no parens", () =>
      expect("super 1, 2 # comment").toMatchFormat());

    test("multiple args, multiple lines, no parens", () => {
      const content = ruby(`
        super 1, # first comment
              2 # second comment
      `);

      return expect(content).toMatchFormat();
    });

    test("multiple args, with parens", () =>
      expect("super(1, 2) # comment").toMatchFormat());

    test("multiple args, multiple lines, with parens", () => {
      const content = ruby(`
        super(
          1, # first comment
          2 # second comment
        )
      `);

      return expect(content).toMatchFormat();
    });
  });
});
