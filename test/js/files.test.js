describe("files", () => {
  test("handles full files that match", () =>
    expect("files/Gemfile").toInferParser());

  test("handles shebangs that match", () =>
    expect("files/shebang").toInferParser());

  test("handles extensions that match", () =>
    expect("files/test.rake").toInferParser());
});
