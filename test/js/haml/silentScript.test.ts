import { haml } from "../utils";

describe("silent script", () => {
  test("single line", () => {
    expect(haml('- foo = "hello"')).toMatchFormat();
  });

  test("multi-line", () => {
    const content = haml(`
      - foo
        - bar
    `);

    expect(content).toMatchFormat();
  });

  test("multi line with case", () => {
    const content = haml(`
      - case foo
      - when 1
        = "1"
        %span bar
      - when 2
        = "2"
      - else
        = "3"
    `);

    expect(content).toMatchFormat();
  });

  test("multi line with if/else", () => {
    const content = haml(`
      - if foo
        %span bar
        -# baz
      - elsif qux
        = "qax"
      - else
        -# qix
    `);

    expect(content).toMatchFormat();
  });

  test("multi line with unless/else", () => {
    const content = haml(`
      - unless foo
        %span bar
        -# baz
      - elsif qux
        = "qax"
      - else
        -# qix
    `);

    expect(content).toMatchFormat();
  });

  test("multi line with embedded", () => {
    const content = haml(`
      - if foo
        %span foo
        - if bar
          %span bar
      - elsif baz
        %span baz
    `);

    expect(content).toMatchFormat();
  });
});
