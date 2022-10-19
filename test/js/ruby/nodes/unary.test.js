describe("unary", () => {
  test("regular", () => {
    return expect("!foo").toMatchFormat();
  });

  // https://github.com/prettier/plugin-ruby/issues/764
  test("with other operator", () => {
    return expect("!(x&.>(0))").toMatchFormat();
  });
});
