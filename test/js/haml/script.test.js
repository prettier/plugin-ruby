const { haml } = require("../utils");

describe("script", () => {
  test("single line", () => {
    expect(haml('%p= "hello"')).toMatchFormat();
  });

  test("multi line", () => {
    const content = haml(`
      %p
        = ['hi', 'there', 'reader!'].join " "
        = "yo"
    `);

    expect(content).toMatchFormat();
  });

  test("escape with interpolate", () => {
    expect(haml(`&= "I like cheese & crackers"`)).toMatchFormat();
  });

  test("children", () => {
    const content = haml(`
      = foo
        = bar
    `);

    expect(content).toMatchFormat();
  });

  test("preserve", () => {
    expect(haml('~ "Foo\\n<pre>Bar\\nBaz</pre>"')).toMatchFormat();
  });
});
