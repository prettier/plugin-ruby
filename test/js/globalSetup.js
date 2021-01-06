const { spawn, spawnSync } = require("child_process");

// Set a RUBY_VERSION environment variable because certain tests will only run
// for certain versions of Ruby.
const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
process.env.RUBY_VERSION = spawnSync("ruby", args).stdout.toString().trim();

function globalSetup() {
  // Spawn the async parser process so that tests can send their content over to
  // it to get back the AST.
  global.__ASYNC_PARSER__ = spawn("ruby", [
    "./src/utils/parser_server.rb",
    process.env.PRETTIER_RUBY_PARSER_HOST
  ]);
}

module.exports = globalSetup;
