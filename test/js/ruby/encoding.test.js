describe("encoding", () => {
  const header = "# -*- encoding: binary -*-";

  test("comments", () => {
    return expect(`${header}\n# il était`).toMatchFormat();
  });

  test("symbol literals", () => {
    return expect(`${header}\n:il_était`).toMatchFormat();
  });

  test("string literals", () => {
    return expect(`${header}\n"ひらがな"`).toMatchFormat();
  });

  test("regexp literals", () => {
    return expect(`${header}\n/ひらがな/`).toMatchFormat();
  });
});
