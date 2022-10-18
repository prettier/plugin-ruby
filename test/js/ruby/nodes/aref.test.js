import { ruby } from "../../utils.js";

describe("aref", () => {
  test("literal reference", () => {
    return expect("array[5]").toMatchFormat();
  });

  test("dynamic reference", () => {
    return expect("array[idx]").toMatchFormat();
  });

  test("reference with comment", () => {
    return expect("array[idx] # foo").toMatchFormat();
  });

  test("literal assignment", () => {
    return expect("array[5] = 6").toMatchFormat();
  });

  test("dynamic assignment", () => {
    return expect("array[idx] = 6").toMatchFormat();
  });

  test("comments within assignment", () => {
    const contents = ruby(`
      array = %w[foo bar]
      array[1] = [
        # abc
        %w[abc]
      ]
    `);

    return expect(contents).toMatchFormat();
  });
});
