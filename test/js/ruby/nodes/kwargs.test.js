const { ruby } = require("../../utils");

describe("kwargs", () => {
  test("basic", () => {
    const content = ruby(`
      def foo(bar: baz)
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("optional", () => {
    const content = ruby(`
      def foo(bar:)
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("double splat", () => {
    const content = ruby(`
      def foo(bar:, **baz)
      end
    `);

    return expect(content).toMatchFormat();
  });
});
