const { long, ruby } = require("./utils");

describe("array", () => {
  test("basic formatting", () => {
    expect("[]").toMatchFormat();
    expect("[1, 2, 3]").toMatchFormat();
  });

  test("transforms basic string arrays", () => {
    expect("['a', 'b', 'c', 'd', 'e']").toChangeFormat("%w[a b c d e]");
    expect("['a', 'b c', 'd', 'e']").toMatchFormat();
    expect(`['a', "b#{c}d", 'e']`).toMatchFormat();
  });

  test("transforms basic symbol arrays", () => {
    expect("[:a, :b, :c]").toChangeFormat("%i[a b c]");
    expect("[:'a + b']").toMatchFormat();
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

  test("adds trailing commas when requested", () => {
    const before = `[${long}, ${long}, ${long}]`;
    const after = `[\n  ${long},\n  ${long},\n  ${long},\n]`;

    expect(before).toChangeFormat(after, { addTrailingCommas: true })
  });

  test("reference", () => {
    expect("array[5]").toMatchFormat();
    expect("array[idx]").toMatchFormat();
  });

  test("assignment", () => {
    expect("array[5] = 6").toMatchFormat();
    expect("array[idx] = 6").toMatchFormat();
  });

  test("comments within assignment", () => {
    const contents = ruby(`
      array = %w[foo bar]
      array[1] = [
        # abc
        %w[abc]
      ]
    `);

    expect(contents).toMatchFormat();
  });
});
