describe("massign", () => {
  test("multi on left, multi on right", () => {
    return expect("a, b, c = 1, 2, 3").toMatchFormat();
  });

  test("single on left, multi on right", () => {
    return expect("a = 1, 2, 3").toMatchFormat();
  });

  test("multi on left, array on right", () => {
    return expect("a, b, c = [1, 2, 3]").toMatchFormat();
  });

  test("parens on left, multi on right", () => {
    return expect("(a, b, c) = 1, 2, 3").toChangeFormat("a, b, c = 1, 2, 3");
  });

  test("double parens on left, multi on right", () => {
    return expect("((a, b, c)) = 1, 2, 3").toChangeFormat("a, b, c = 1, 2, 3");
  });

  test("parens on some of left, multi on right", () => {
    return expect("(a, b), c = [1, 2], 3").toMatchFormat();
  });

  test("extra commas at the end", () => {
    return expect("a, = 1").toMatchFormat();
  });

  test("extra commas at the end with multiple", () => {
    return expect("a, b, c, = 1").toMatchFormat();
  });

  test("extra commas with parens", () => {
    return expect("(a, b,), c, = 1").toMatchFormat();
  });

  test("extra commas with doubled parens", () => {
    return expect("((a, b,), c,), = 1").toMatchFormat();
  });

  describe("splat", () => {
    test("after ident", () => {
      return expect("a, *b = 1, 2, 3").toMatchFormat();
    });

    test("between idents", () => {
      return expect("a, *b, c, d = 1, 2, 3").toMatchFormat();
    });

    test("with no name", () => {
      return expect("a, * = 1, 2, 3").toMatchFormat();
    });

    test("on right side", () => {
      return expect("a = *a").toMatchFormat();
    });

    test("only on left side", () => {
      return expect("* = [1, 2, 3]").toMatchFormat();
    });

    test("and then ident on left side", () => {
      return expect("*, a = [1, 2, 3]").toMatchFormat();
    });
  });
});
