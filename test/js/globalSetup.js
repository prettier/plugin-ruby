const { spawn, spawnSync } = require("child_process");
const { unlinkSync } = require("fs");
const path = require("path");

const { getLang, getInfoFilepath } = require("../../src/parseSync");

// This is somewhat similar to the spawnServer function in parseSync but
// slightly different in that it logs its information into environment variables
// so that it can be reused across the test suite.
function globalSetup() {
  // Set a RUBY_VERSION environment variable because certain tests will only run
  // for certain versions of Ruby.
  const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
  process.env.RUBY_VERSION = spawnSync("ruby", args).stdout.toString().trim();

  // Set up just one parsing server for the entirety of the test suite.
  const filepath = getInfoFilepath();
  const server = spawn(
    "ruby",
    [path.join(__dirname, "../../src/server.rb"), "--plugins=", filepath],
    {
      env: Object.assign({}, process.env, { LANG: getLang() }),
      detached: true,
      stdio: "inherit"
    }
  );

  // Get the connection information from the parsing server.
  const information = spawnSync("node", [
    path.join(__dirname, "../../src/getInfo.js"),
    filepath
  ]);

  if (information.status !== 0) {
    throw new Error(information.stderr.toString());
  }

  process.env.PRETTIER_RUBY_HOST = information.stdout.toString();
  process.env.PRETTIER_RUBY_PID = `${server.pid}`;

  unlinkSync(filepath);
  server.unref();
}

module.exports = globalSetup;
