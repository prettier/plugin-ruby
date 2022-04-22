describe("yield", () => {
  test("bare yield", () => {
    expect("yield").toMatchFormat();
  });

  test("yield with one argument, no parens", () => {
    expect("yield i").toMatchFormat();
  });

  test("yield with one argument, with parens", () => {
    expect("yield(i)").toMatchFormat();
  });

  test("yield with multiple arguments, no parens", () => {
    expect("yield i, 2").toMatchFormat();
  });

  test("yield with multiple arguments, with parens", () => {
    expect("yield(i, 2)").toMatchFormat();
  });
});
