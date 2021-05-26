const { spawn, spawnSync } = require("child_process");
const os = require("os");

// Set a RUBY_VERSION environment variable because certain tests will only run
// for certain versions of Ruby.
const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
process.env.RUBY_VERSION = spawnSync("ruby", args).stdout.toString().trim();

// Spawn the async parser process so that tests can send their content over to
// it to get back the AST.
function globalSetup() {
  let parserArgs;

  if (os.type() === "Windows_NT") {
    parserArgs = ["--tcp", "8912"];
  } else {
    parserArgs = ["--unix", `/tmp/prettier-ruby-test-${process.pid}.sock`];
  }

  if (!process.env.PRETTIER_RUBY_HOST) {
    process.env.PRETTIER_RUBY_HOST = parserArgs[1];
  }

  global.__ASYNC_PARSER__ = spawn(
    "ruby",
    ["./src/parser/server.rb"].concat(parserArgs)
  );
}

module.exports = globalSetup;
