import { ruby } from "../utils";

describe("ignore", () => {
  test("you can ignore code blocks", () => {
    const content = ruby(`
      # prettier-ignore
      class Foo; def bar; 1+1+1; end; end
    `);

    expect(content).toMatchFormat();
  });
});
