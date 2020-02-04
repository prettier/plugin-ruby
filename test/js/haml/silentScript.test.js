const { ruby } = require("../utils");

describe("silent script", () => {
  test("single line", () => {
    expect('- foo = "hello"').toMatchHamlFormat();
  });

  test("multi line with case", () => {
    const content = ruby(`
      - case foo
      - when 1
        = "1"
        %span bar
      - when 2
        = "2"
      - else
        = "3"
    `);

    expect(content).toMatchHamlFormat();
  });

  test("multi line with if/else", () => {
    const content = ruby(`
      - if foo
        %span bar
        -# baz
      - elsif qux
        = "qax"
      - else
        -# qix
    `);

    expect(content).toMatchHamlFormat();
  });

  test("multi line with unless/else", () => {
    const content = ruby(`
      - unless foo
        %span bar
        -# baz
      - elsif qux
        = "qax"
      - else
        -# qix
    `);

    expect(content).toMatchHamlFormat();
  });
});
