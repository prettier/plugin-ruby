const { ruby } = require("./utils");

describe("heredocs and block in arg parens", () => {
  test("heredoc only", () => {
    const content = ruby(`
      call(<<~HEREDOC
        content
      HEREDOC
      ) { 'block' }
    `);

    return expect(content).toMatchFormat();
  });

  test("arg before heredoc", () => {
    const content = ruby(`
      call(arg,
        <<~HEREDOC
        content
      HEREDOC
      ) { 'block' }
    `);

    return expect(content).toMatchFormat();
  });

  test("arg after heredoc", () => {
    const content = ruby(`
      call(<<~HEREDOC,
        content
      HEREDOC
        arg
      ) { 'block' }
    `);

    return expect(content).toMatchFormat();
  });

  test("trailing commas ending in heredoc", () => {
    const content = ruby(`
      call(<<~HEREDOC,
        content
      HEREDOC
      ) { 'block' }
    `);

    return expect(content).toMatchFormat({ addTrailingCommas: true });
  });

  test("trailing commas ending in arg", () => {
    const content = ruby(`
      call(<<~HEREDOC,
        content
      HEREDOC
        arg,
      ) { 'block' }
    `);

    return expect(content).toMatchFormat({ addTrailingCommas: true });
  });
});
