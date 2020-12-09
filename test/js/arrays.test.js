const { long, ruby } = require("./utils");

describe("array", () => {
  test("empty arrays", () => expect("[]").toMatchFormat());

  test("basic formatting", () => expect("[1, 2, 3]").toMatchFormat());

  test("transforms basic string arrays", () =>
    expect("['a', 'b', 'c', 'd', 'e']").toChangeFormat("%w[a b c d e]"));

  test("does not transform string arrays with spaces", () =>
    expect("['a', 'b c', 'd', 'e']").toMatchFormat());

  test("does not transform string arrays with tabs", () =>
    expect(`['a', "b\\tc", 'd', 'e']`).toMatchFormat());

  test("does not transform string arrays with newlines", () =>
    expect(`['a', "b\\nc", 'd', 'e']`).toMatchFormat());

  test("does not transform string arrays with carriage returns", () =>
    expect(`['a', "b\\rc", 'd', 'e']`).toMatchFormat());

  test("does not transform string arrays with interpolation", () =>
    expect(`['a', "b#{c}d", 'e']`).toMatchFormat());

  test("does not transform string arrays with brackets", () =>
    expect(`['a [] b', 'c [] d']`).toMatchFormat());

  test("transforms basic symbol arrays", () =>
    expect("[:a, :b, :c]").toChangeFormat("%i[a b c]"));

  test("does not transform symbol arrays with dynamic symbols", () =>
    expect("[:'a + b']").toMatchFormat());

  test("handles splats", () => expect("[1, 2, *[3, 4], 5, 6]").toMatchFormat());

  test("breaks appropriately", () => {
    const contents = ruby(`
      [
        ${long},
        ${long},
        [
          ${long},
          ${long},
          ${long}
        ]
      ]
    `);

    return expect(contents).toMatchFormat();
  });

  test("adds trailing commas when requested", () => {
    const before = `[${long}, ${long}, ${long}]`;
    const after = `[\n  ${long},\n  ${long},\n  ${long},\n]`;

    return expect(before).toChangeFormat(after, { trailingComma: "all" });
  });

  test("breaking maintains calls on the end", () =>
    expect(`[${long}].freeze`).toChangeFormat(`[\n  ${long}\n].freeze`));

  describe("heredocs", () => {
    test("as the first value", () => {
      const content = ruby(`
        [<<~HERE, foo]
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        [foo, <<~HERE]
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("with splats in the array", () => {
      const content = ruby(`
        [foo, *bar, baz, <<~HERE]
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("with trailing commas", () => {
      const content = ruby(`
        [
          ${long},
          <<~HERE,
            this is the heredoc
          HERE
        ]
      `);

      return expect(content).toMatchFormat({ trailingComma: "all" });
    });
  });
});
