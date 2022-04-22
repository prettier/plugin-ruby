const { haml } = require("../utils");

describe("comment", () => {
  test("single line", () => {
    expect(haml("/ This is the peanutbutterjelly element")).toMatchFormat();
  });

  test("multi line", () => {
    const content = haml(`
      /
        %p This doesn't render, because it's commented out!
    `);

    expect(content).toMatchFormat();
  });

  test("conditional", () => {
    const content = haml(`
      /[if IE]
        %h1 Get Firefox
    `);

    expect(content).toMatchFormat();
  });

  test("revealed", () => {
    const content = haml(`
      /![if !IE]
        You are not using Internet Explorer, or are using version 10+.
    `);

    expect(content).toMatchFormat();
  });
});
