const { ruby } = require("./utils");

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
    const contents = ruby`
      [
        super_super_super_super_super_super_long,
        super_super_super_super_super_super_long,
        [
          super_super_super_super_super_super_long,
          super_super_super_super_super_super_long,
          super_super_super_super_super_super_long
        ]
      ]
    `;

    expect(contents).toMatchFormat();
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
    const contents = ruby`
      array = %w[foo bar]
      array[1] = [
        # abc
        %w[abc]
      ]
    `;

    expect(contents).toMatchFormat();
  });
});
