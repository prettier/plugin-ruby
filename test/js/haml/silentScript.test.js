describe("silent script", () => {
  test("single line", () => {
    expect('- foo = "hello"').toMatchHamlFormat();
  });
});
