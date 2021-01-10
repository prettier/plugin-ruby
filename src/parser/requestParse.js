const { spawn, spawnSync, execSync } = require("child_process");
const path = require("path");
const { existsSync, mkdtempSync } = require("fs");
const process = require("process");
const os = require("os");

const getNetcat = require("./getNetcat");
const getLang = require("./getLang");

let sockfile = process.env.PRETTIER_RUBY_HOST;

// Spawn the parser.rb subprocess. We do this since booting Ruby is slow, and we
// can re-use the parser process multiple times since it is statelesss.
function spawnParseServer() {
  const server = spawn(
    "ruby",
    [path.join(__dirname, "./server.rb"), sockfile],
    {
      env: Object.assign({}, process.env, { LANG: getLang() }),
      detached: true,
      stdio: "inherit"
    }
  );

  process.on("exit", () => {
    try {
      process.kill(-server.pid);
    } catch (e) {
      // ignore
    }
  });

  server.unref();
  const now = new Date();

  // Wait for server to go live.
  while (!existsSync(sockfile) && new Date() - now < 3000) {
    execSync("sleep 0.1");
  }
}

// Ensures that a parser server is currently running by checking against the
// sockfile variable. If it is not, create a temporary directory to house the
// sockfile and spawn the ruby process.
function ensureParseServer() {
  if (sockfile) {
    return;
  }

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "prettier-ruby"));
  sockfile = path.join(tmpDir, `${process.pid}.sock`);

  spawnParseServer();
}

// Sends a request to the parse server to parse the given content.
function requestParse(parser, source) {
  ensureParseServer();

  const { command, arg } = getNetcat();
  const { stdout, stderr, status } = spawnSync(command, [arg, sockfile], {
    input: `${parser}|${source}`,
    maxBuffer: 15 * 1024 * 1024
  });

  return {
    command,
    stdout: stdout.toString(),
    stderr: stderr.toString(),
    status
  };
}

module.exports = requestParse;
