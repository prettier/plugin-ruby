import { long, ruby } from "../../utils.js";

describe("array", () => {
  test("empty arrays", () => {
    return expect("[]").toMatchFormat();
  });

  test("basic formatting", () => {
    return expect("[1, 2, 3]").toMatchFormat();
  });

  test("does not transform single string arrays", () => {
    return expect(`["a"]`).toMatchFormat();
  });

  test("does not transform single symbol arrays", () => {
    return expect("[:a]").toMatchFormat();
  });

  test("transforms basic string arrays", () => {
    return expect(`["a", "b", "c", "d", "e"]`).toChangeFormat("%w[a b c d e]");
  });

  test("does not transform string arrays with interpolation", () => {
    return expect(`["a", "#{b}", "c"]`).toMatchFormat();
  });

  test("does not transform string arrays with spaces", () => {
    return expect(`["a", "b c", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with tabs", () => {
    return expect(`["a", "b\\tc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with newlines", () => {
    return expect(`["a", "b\\nc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with carriage returns", () => {
    return expect(`["a", "b\\rc", "d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with interpolation", () => {
    return expect(`["a", "b#{c}d", "e"]`).toMatchFormat();
  });

  test("does not transform string arrays with brackets", () => {
    return expect(`["a [] b", "c [] d"]`).toMatchFormat();
  });

  test("transforms basic symbol arrays", () => {
    return expect("[:a, :b, :c]").toChangeFormat("%i[a b c]");
  });

  test("does not transform symbol arrays with dynamic symbols", () => {
    return expect(`[:"a + b"]`).toMatchFormat();
  });

  test("handles splats", () => {
    return expect("[1, 2, *[3, 4], 5, 6]").toMatchFormat();
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

    return expect(contents).toMatchFormat();
  });

  test("breaking maintains calls on the end", () => {
    return expect(`[${long}].freeze`).toChangeFormat(`[\n  ${long}\n].freeze`);
  });

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
  });

  test("with leading comments but none in body", () => {
    const content = ruby(`
      # leading
      []
    `);

    return expect(content).toMatchFormat();
  });

  test("with leading comments and comments in the body", () => {
    const content = ruby(`
      # leading
      [
        # inside
        # body
      ]
    `);

    return expect(content).toMatchFormat();
  });

  test("with comments just in the body", () => {
    const content = ruby(`
      [
        # inside
        # body
      ]
    `);

    return expect(content).toMatchFormat();
  });

  test("with comments just outside but attached", () => {
    const content = ruby(`
      foo(
        [] # comment comment
      )
    `);

    return expect(content).toMatchFormat();
  });

  test.each(["%w", "%W", "%i", "%I"])("%s special array literals", (start) =>
    expect(`${start}[a b c]`).toMatchFormat()
  );
});
