describe("field", () => {
  test("basic", () => {
    return expect("foo.x = 1").toMatchFormat();
  });

  test("replaces :: with .", () => {
    return expect("foo::x = 1").toChangeFormat("foo.x = 1");
  });

  test("with lonely operator", () => {
    return expect("foo&.x = 1").toMatchFormat();
  });
});
