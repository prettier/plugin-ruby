const { ruby } = require("../utils");

describe("ignore", () => {
  test("you can ignore code blocks", () => {
    const content = ruby(`
      # stree-ignore
      class Foo; def bar; 1+1+1; end; end
    `);

    expect(content).toMatchFormat();
  });
});
