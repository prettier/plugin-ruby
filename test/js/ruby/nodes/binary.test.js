import { long, ruby } from "../../utils.js";

describe("binary", () => {
  test("single line", () => {
    return expect("foo && bar && baz").toMatchFormat();
  });

  test("multi line", () => {
    return expect(`${long} && ${long} && ${long}`).toChangeFormat(
      `${long} &&\n  ${long} &&\n  ${long}`
    );
  });

  test("no indent on the right", () => {
    const content = `foo << [${long}]`;
    const expected = ruby(`
      foo << [
        ${long}
      ]
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("with heredoc and comment", () => {
    const content = ruby(`
      foo << <<~HERE # comment
        bar
      HERE
    `);

    return expect(content).toMatchFormat();
  });

  test("no spaces for **", () => {
    return expect("a**b").toMatchFormat();
  });
});
