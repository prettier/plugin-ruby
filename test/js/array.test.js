const { long, ruby } = require("./utils");

describe("array", () => {
  test("empty arrays", () => (
    expect("[]").toMatchFormat()
  ));

  test("basic formatting", () => (
    expect("[1, 2, 3]").toMatchFormat()
  ));

  test("transforms basic string arrays", () => (
    expect("['a', 'b', 'c', 'd', 'e']").toChangeFormat("%w[a b c d e]")
  ));

  test("does not transform string arrays with spaces", () => (
    expect("['a', 'b c', 'd', 'e']").toMatchFormat()
  ));

  test("does not transform string arrays with interpolation", () => (
    expect(`['a', "b#{c}d", 'e']`).toMatchFormat()
  ));

  test("transforms basic symbol arrays", () => (
    expect("[:a, :b, :c]").toChangeFormat("%i[a b c]")
  ));

  test("does not transform symbol arrays with dynamic symbols", () => (
    expect("[:'a + b']").toMatchFormat()
  ));

  test("handles splats", () => (
    expect("[1, 2, *[3, 4], 5, 6]").toMatchFormat()
  ));

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

    return expect(before).toChangeFormat(after, { addTrailingCommas: true });
  });

  test("literal reference", () => (
    expect("array[5]").toMatchFormat()
  ));

  test("dynamic reference", () => (
    expect("array[idx]").toMatchFormat()
  ));

  test("literal assignment", () => (
    expect("array[5] = 6").toMatchFormat()
  ));

  test("dynamic assignment", () => (
    expect("array[idx] = 6").toMatchFormat()
  ));

  test("comments within assignment", () => {
    const contents = ruby(`
      array = %w[foo bar]
      array[1] = [
        # abc
        %w[abc]
      ]
    `);

    return expect(contents).toMatchFormat();
  });

  test("breaking maintains calls on the end", () => (
    expect(`[${long}].freeze`).toChangeFormat(`[\n  ${long}\n].freeze`)
  ));

  describe.each(["<<-HERE", "<<~HERE"])("%s heredocs as elements", start => {
    test("as the first value", () => {
      const content = ruby(`
        [
          ${start},
            this is the heredoc
          HERE
          foo
        ]
      `);

      return expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        [
          foo,
          ${start}
            this is the heredoc
          HERE
        ]
      `);

      return expect(content).toMatchFormat();
    });

    test("with splats in the array", () => {
      const content = ruby(`
        [
          foo,
          *bar,
          baz,
          ${start}
            this is the heredoc
          HERE
        ]
      `);

      return expect(content).toMatchFormat();
    });

    test("with trailing commas", () => {
      const content = ruby(`
        [
          ${start},
            this is the heredoc
          HERE
        ]
      `);

      return expect(content).toMatchFormat({ addTrailingCommas: true });
    });
  });
});
