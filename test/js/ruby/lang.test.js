const { spawnSync } = require("child_process");
const path = require("path");

expect.extend({
  toHaveExitedCleanly(child) {
    return {
      pass: child.status === 0,
      message: () => child.stderr.toString()
    };
  }
});

test("different lang settings don't break", () => {
  const script = path.join(__dirname, "../../../node_modules/.bin/prettier");

  const env = { ...process.env, LANG: "US-ASCII" };
  // Make sure a new parser server is spawned
  delete env.PRETTIER_RUBY_PARSER_HOST;

  const child = spawnSync(
    process.execPath,
    [script, "--plugin", ".", "--parser", "ruby"],
    {
      env,
      input: "'# あ'"
    }
  );

  expect(child).toHaveExitedCleanly();
});
