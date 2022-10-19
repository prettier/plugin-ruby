import { ruby } from "../../utils.js";

describe("super", () => {
  test("bare", () => {
    return expect("super").toMatchFormat();
  });

  test("empty parens", () => {
    return expect("super()").toMatchFormat();
  });

  test("one arg, no parens", () => {
    return expect("super 1").toMatchFormat();
  });

  test("one arg, with parens", () => {
    return expect("super(1)").toMatchFormat();
  });

  test("multiple args, no parens", () => {
    return expect("super 1, 2").toMatchFormat();
  });

  test("multiple args, with parens", () => {
    return expect("super(1, 2)").toMatchFormat();
  });

  describe("with comments", () => {
    test("bare", () => {
      return expect("super # comment").toMatchFormat();
    });

    test("empty parens", () => {
      return expect("super() # comment").toMatchFormat();
    });

    test("one arg, no parens", () => {
      return expect("super 1 # comment").toMatchFormat();
    });

    test("one arg, with parens", () => {
      return expect("super(1) # comment").toMatchFormat();
    });

    test("multiple args, no parens", () => {
      return expect("super 1, 2 # comment").toMatchFormat();
    });

    test("multiple args, multiple lines, no parens", () => {
      const content = ruby(`
        super 1, # first comment
              2 # second comment
      `);

      return expect(content).toMatchFormat();
    });

    test("multiple args, with parens", () => {
      return expect("super(1, 2) # comment").toMatchFormat();
    });

    test("multiple args, multiple lines, no parens", () => {
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
