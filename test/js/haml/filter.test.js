const { ruby } = require("../utils");

describe("filter", () => {
  test("custom", () => {
    const content = ruby(`
      :python
        def foo:
          bar
    `);

    expect(content).toMatchHamlFormat();
  });

  test("css", () => {
    const content = ruby(`
      :css
        .foo { height: 100px; }
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
        :css
          .foo {
            height: 100px;
          }
      `)
    );
  });

  test("javascript", () => {
    const content = ruby(`
      :javascript
        1+1
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
        :javascript
          1 + 1;
      `)
    );
  });

  test("less", () => {
    const content = ruby(`
      :less
        .foo { .bar { height: 100px; } }
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
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
    const content = ruby(`
      :markdown
        *Hello, world!*
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
        :markdown
          _Hello, world!_
      `)
    );
  });

  test("ruby", () => {
    const content = ruby(`
      :ruby
        1+1
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
        :ruby
          1 + 1
      `)
    );
  });

  test("scss", () => {
    const content = ruby(`
      :scss
        .foo { .bar { height: 100px; } }
    `);

    expect(content).toChangeHamlFormat(
      ruby(`
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
