const { ruby } = require("../utils");

describe("script", () => {
  test("single line", () => {
    expect("%p= \"hello\"").toMatchHamlFormat();
  });

  test("multi line", () => {
    const content = ruby(`
      %p
        = ['hi', 'there', 'reader!'].join " "
        = "yo"
    `);

    expect(content).toMatchHamlFormat();
  });

  test("preserve", () => {
    expect("~ \"Foo\\n<pre>Bar\\nBaz</pre>\"").toMatchHamlFormat();
  });
});
