import { haml } from "../utils";

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

    expect(content).toChangeFormat(
      haml(`
        :css
          .foo {
            height: 100px;
            width: 100px;
          }
      `)
    );
  });

  test("javascript", () => {
    const content = haml(`
      :javascript
        1+1
    `);

    expect(content).toChangeFormat(
      haml(`
        :javascript
          1 + 1;
      `)
    );
  });

  test("less", () => {
    const content = haml(`
      :less
        .foo { .bar { height: 100px; } }
    `);

    expect(content).toChangeFormat(
      haml(`
        :less
          .foo {
            .bar {
              height: 100px;
            }
          }
      `)
    );
  });

  test("markdown", () => {
    const content = haml(`
      :markdown
        *Hello, world!*
    `);

    expect(content).toChangeFormat(
      haml(`
        :markdown
          _Hello, world!_
      `)
    );
  });

  test("scss", () => {
    const content = haml(`
      :scss
        .foo { .bar { height: 100px; } }
    `);

    expect(content).toChangeFormat(
      haml(`
        :scss
          .foo {
            .bar {
              height: 100px;
            }
          }
      `)
    );
  });
});
