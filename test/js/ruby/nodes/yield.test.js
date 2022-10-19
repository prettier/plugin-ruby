describe("yield", () => {
  test("bare yield", () => {
    return expect("yield").toMatchFormat();
  });

  test("yield with one argument, no parens", () => {
    return expect("yield i").toMatchFormat();
  });

  test("yield with one argument, with parens", () => {
    return expect("yield(i)").toMatchFormat();
  });

  test("yield with multiple arguments, no parens", () => {
    return expect("yield i, 2").toMatchFormat();
  });

  test("yield with multiple arguments, with parens", () => {
    return expect("yield(i, 2)").toMatchFormat();
  });
});
