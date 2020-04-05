const { long, ruby } = require("../utils");

describe("tag", () => {
  test("class", () => {
    expect("%p.foo").toMatchHamlFormat();
  });

  test("class multiple", () => {
    expect("%p.foo.bar.baz").toMatchHamlFormat();
  });

  test("id", () => {
    expect("%p#foo").toMatchHamlFormat();
  });

  test("classes and id", () => {
    expect("%p.foo.bar#baz").toMatchHamlFormat();
  });

  test("self closing", () => {
    expect("%br/").toMatchHamlFormat();
  });

  test("whitespace removal right single line", () => {
    expect('%p<= "Foo\\nBar"').toMatchHamlFormat();
  });

  test("whitespace removal right multi line", () => {
    const content = ruby(`
      %blockquote<
        %div
          Foo!
    `);

    expect(content).toMatchHamlFormat();
  });

  test("dynamic attributes", () => {
    const content = "%div{ data: { controller: 'lesson-evaluation' } }";

    expect(content).toMatchHamlFormat();
  });

  test("object reference", () => {
    const content = ruby(`
      %div[@user, :greeting]
        %bar[290]/
        Hello!
    `);

    expect(content).toMatchHamlFormat();
  });

  test("long declaration before text", () => {
    const declaration = `%button{ data: { current: ${long} } }`;

    expect(`${declaration} foo`).toChangeHamlFormat(`${declaration}\n  foo`);
  });
});
