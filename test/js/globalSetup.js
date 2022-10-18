import { spawn, spawnSync } from "child_process";
import { unlinkSync } from "fs";
import url from "url";
import { getLang, getInfoFilepath } from "../../src/parseSync.js";

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
    [url.fileURLToPath(new URL("../../src/server.rb", import.meta.url)), "--plugins=", filepath],
    {
      env: Object.assign({}, process.env, { LANG: getLang() }),
      detached: true,
      stdio: "inherit"
    }
  );

  // Get the connection information from the parsing server.
  const information = spawnSync("node", [
    url.fileURLToPath(new URL("../../src/getInfo.js", import.meta.url)),
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

export default globalSetup;
