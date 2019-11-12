const { ruby } = require("../utils");

describe("comment", () => {
  test("single line", () => {
    expect("/ This is the peanutbutterjelly element").toMatchHamlFormat();
  });

  test("multi line", () => {
    const content = ruby(`
      /
        %p This doesn't render, because it's commented out!
    `);

    expect(content).toMatchHamlFormat();
  });

  test("conditional", () => {
    const content = ruby(`
      /[if IE]
        %h1 Get Firefox
    `);

    expect(content).toMatchHamlFormat();
  });

  test("revealed", () => {
    const content = ruby(`
      /![if !IE]
        You are not using Internet Explorer, or are using version 10+.
    `);

    expect(content).toMatchHamlFormat();
  });
});
