import { long, ruby } from "../../utils.js";

describe("array", () => {
  test("empty arrays", () => {
    expect("[]").toMatchFormat();
  });

  test("basic formatting", () => {
    expect("[1, 2, 3]").toMatchFormat();
  });

  test("does not transform single string arrays", () => {
    expect(`["a"]`).toMatchFormat();
  });

  test("does not transform single symbol arrays", () => {
    expect("[:a]").toMatchFormat();
  });

  test("transforms basic string arrays", () => {
    expect(`["a", "b", "c", "d", "e"]`).toChangeFormat("%w[a b c d e]");
  });

  test("does not transform string arrays with interpolation", () => {
    expect(`["a", "#{b}", "c"]`).toMatchFormat();
  });

  test("does not transform string arrays with spaces", () => {
    expect(`["a", "b c", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with tabs", () => {
    expect(`["a", "b\\tc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with newlines", () => {
    expect(`["a", "b\\nc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with carriage returns", () => {
    expect(`["a", "b\\rc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with interpolation", () => {
    expect(`["a", "b#{c}d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with brackets", () => {
    expect(`["a [] b", "c [] d"]`).toMatchFormat();
  });

  test("transforms basic symbol arrays", () => {
    expect("[:a, :b, :c]").toChangeFormat("%i[a b c]");
  });

  test("does not transform symbol arrays with dynamic symbols", () => {
    expect(`[:"a + b"]`).toMatchFormat();
  });

  test("handles splats", () => {
    expect("[1, 2, *[3, 4], 5, 6]").toMatchFormat();
  });

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

    expect(contents).toMatchFormat();
  });

  test("breaking maintains calls on the end", () => {
    expect(`[${long}].freeze`).toChangeFormat(`[\n  ${long}\n].freeze`);
  });

  describe("heredocs", () => {
    test("as the first value", () => {
      const content = ruby(`
        [<<~HERE, foo]
          this is the heredoc
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        [foo, <<~HERE]
          this is the heredoc
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("with splats in the array", () => {
      const content = ruby(`
        [foo, *bar, baz, <<~HERE]
          this is the heredoc
        HERE
      `);

      expect(content).toMatchFormat();
    });
  });

  test("with leading comments but none in body", () => {
    const content = ruby(`
      # leading
      []
    `);

    expect(content).toMatchFormat();
  });

  test("with leading comments and comments in the body", () => {
    const content = ruby(`
      # leading
      [
        # inside
        # body
      ]
    `);

    expect(content).toMatchFormat();
  });

  test("with comments just in the body", () => {
    const content = ruby(`
      [
        # inside
        # body
      ]
    `);

    expect(content).toMatchFormat();
  });

  test("with comments just outside but attached", () => {
    const content = ruby(`
      foo(
        [] # comment comment
      )
    `);

    expect(content).toMatchFormat();
  });

  test.each(["%w", "%W", "%i", "%I"])("%s special array literals", (start) =>
    expect(`${start}[a b c]`).toMatchFormat()
  );
});
