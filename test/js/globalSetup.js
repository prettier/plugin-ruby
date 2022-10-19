import { spawnSync } from "child_process";
import { spawnServer } from "../../src/parse.js";

// This is somewhat similar to the spawnServer function in parseSync but
// slightly different in that it logs its information into environment variables
// so that it can be reused across the test suite.
async function globalSetup() {
  // Set a RUBY_VERSION environment variable because certain tests will only run
  // for certain versions of Ruby.
  const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
  process.env.RUBY_VERSION = spawnSync("ruby", args)
    .stdout.toString("utf-8")
    .trim();

  const { serverPID, connectionFilepath, connectionOptions } =
    await spawnServer(
      {
        rubyPlugins: "",
        rubySingleQuote: false,
        trailingComma: "none"
      },
      false
    );

  process.env.PRETTIER_RUBY_PID = serverPID;
  process.env.PRETTIER_RUBY_FILE = connectionFilepath;
  process.env.PRETTIER_RUBY_HOST = JSON.stringify(connectionOptions);
}

export default globalSetup;
