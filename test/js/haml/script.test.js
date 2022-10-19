import { haml } from "../utils";

describe("script", () => {
  test("single line", () => {
    return expect(haml('%p= "hello"')).toMatchFormat();
  });

  test("multi line", () => {
    const content = haml(`
      %p
        = ['hi', 'there', 'reader!'].join " "
        = "yo"
    `);

    return expect(content).toMatchFormat();
  });

  test("escape with interpolate", () => {
    return expect(haml(`&= "I like cheese & crackers"`)).toMatchFormat();
  });

  test("children", () => {
    const content = haml(`
      = foo
        = bar
    `);

    return expect(content).toMatchFormat();
  });

  test("preserve", () => {
    return expect(haml('~ "Foo\\n<pre>Bar\\nBaz</pre>"')).toMatchFormat();
  });
});
