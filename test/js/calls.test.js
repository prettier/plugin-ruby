const { ruby } = require("./utils");

describe("calls", () => {
  test("simple calls", () => {
    const content = ruby(`
    posts.active.where('created_at > ?', 1.year.ago).order('id asc')
    `);

    return expect(content).toMatchFormat();
  });

  test("chain methods", () => {
    const before = ruby(`
    posts.active.where('created_at > ?', 1.year.ago).order('id asc').limit(10)
    `);
    const after = ruby(`
    posts
      .active
      .where('created_at > ?', 1.year.ago)
      .order('id asc')
      .limit(10)
    `);

    return expect(before).toChangeFormat(after);
  });
});
