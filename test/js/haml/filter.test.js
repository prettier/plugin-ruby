import { haml } from "../utils";

describe("filter", () => {
  test("self", () => {
    const content = haml(`
      :haml
        -# comment
    `);

    return expect(content).toMatchFormat();
  });

  test("custom", () => {
    const content = haml(`
      :python
        def foo:
          bar
    `);

    return expect(content).toMatchFormat();
  });

  test("css", () => {
    const content = haml(`
      :css
        .foo { height: 100px; width: 100px; }
    `);

    return expect(content).toMatchFormat();
  });
});
