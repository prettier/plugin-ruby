describe("encoding", () => {
  const header = "# -*- encoding: binary -*-";

  test("comments", () => {
    expect(`${header}\n# il était`).toMatchFormat();
  });

  test("symbol literals", () => {
    expect(`${header}\n:il_était`).toMatchFormat();
  });

  test("string literals", () => {
    expect(`${header}\n"ひらがな"`).toMatchFormat();
  });

  test("regexp literals", () => {
    expect(`${header}\n/ひらがな/`).toMatchFormat();
  });
});
