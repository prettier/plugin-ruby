import { ruby } from "../utils.js";

describe("ignore", () => {
  test("you can ignore code blocks", () => {
    const content = ruby(`
      # stree-ignore
      class Foo; def bar; 1+1+1; end; end
    `);

    return expect(content).toMatchFormat();
  });
});
