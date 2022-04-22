const { haml } = require("../utils");

describe("filter", () => {
  test("self", () => {
    const content = haml(`
      :haml
        -# comment
    `);

    expect(content).toMatchFormat();
  });

  test("custom", () => {
    const content = haml(`
      :python
        def foo:
          bar
    `);

    expect(content).toMatchFormat();
  });

  test("css", () => {
    const content = haml(`
      :css
        .foo { height: 100px; width: 100px; }
    `);

    expect(content).toMatchFormat();
  });
});
