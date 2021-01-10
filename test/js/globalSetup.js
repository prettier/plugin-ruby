const { spawn, spawnSync } = require("child_process");

// Set a RUBY_VERSION environment variable because certain tests will only run
// for certain versions of Ruby.
const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
process.env.RUBY_VERSION = spawnSync("ruby", args).stdout.toString().trim();

// Spawn the async parser process so that tests can send their content over to
// it to get back the AST.
function globalSetup() {
  if (!process.env.PRETTIER_RUBY_HOST) {
    process.env.PRETTIER_RUBY_HOST = `/tmp/prettier-ruby-test-${process.id}.sock`;
  }

  global.__ASYNC_PARSER__ = spawn("ruby", [
    "./src/parser/server.rb",
    process.env.PRETTIER_RUBY_HOST
  ]);
}

module.exports = globalSetup;
