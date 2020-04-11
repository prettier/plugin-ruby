describe("files", () => {
  test("handles full files that match", () =>
    expect("files/Gemfile").toInferRubyParser());

  test("handles shebangs that match", () =>
    expect("files/shebang").toInferRubyParser());

  test("handles extensions that match", () =>
    expect("files/test.rake").toInferRubyParser());

  test("handles extensions that match haml", () =>
    expect("files/test.haml").toInferHamlParser());
});
