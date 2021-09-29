describe("unary", () => {
  test("regular", () => {
    expect("!foo").toMatchFormat();
  });

  // https://github.com/prettier/plugin-ruby/issues/764
  test("with other operator", () => {
    expect("!(x&.>(0))").toMatchFormat();
  });
});
