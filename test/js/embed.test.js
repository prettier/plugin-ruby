const { ruby } = require("./utils");

describe("embed", () => {
  test("formats correctly on straight heredocs", () => {
    const content = ruby(`
      <<-JS
      const a=1;
      const b=2;
      return a+b;
      JS
    `);

    const expected = ruby(`
      <<-JS
      const a = 1;
      const b = 2;
      return a + b;
      JS
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("formats correctly on squiggly heredocs", () => {
    const content = ruby(`
      <<~JS
        const a=1;
        const b=2;
        return a+b;
      JS
    `);

    const expected = ruby(`
      <<~JS
        const a = 1;
        const b = 2;
        return a + b;
      JS
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("does not format if the heredoc has an interpolation", () => {
    const content = ruby(`
      <<~JS
        const a=1;
        const b=#{2};
        return a+b;
      JS
    `);

    return expect(content).toMatchFormat();
  });
});
