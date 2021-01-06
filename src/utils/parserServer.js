const { spawn, spawnSync, execSync } = require("child_process");
const path = require("path");
const { existsSync, mkdtempSync } = require("fs");
const process = require("process");
const os = require("os");

let SOCKFILE = null;

// Spawn the parser_server.rb subprocess. We do this since booting Ruby is slow,
// and we can re-use the parser process multiple times since it is statelesss.
// By doing this, we increase the performance by 10x.
function spawnParserServer(sockfile, env) {
  const server = spawn(
    "ruby",
    ["--disable-gems", path.join(__dirname, "./parser_server.rb"), sockfile],
    {
      env: Object.assign({ PARSER_SERVER_TIMEOUT: "600" }, process.env, env),
      detached: true,
      stdio: "inherit"
    }
  );

  process.on("exit", (code) => process.kill(-server.pid));

  server.unref();

  process.on("beforeExit", (code) => server.kill());

  const now = new Date();

  // Wait for server to go live
  while (!existsSync(sockfile) && new Date() - now < 3000) {
    execSync("sleep 0.1");
  }
}

// Creates a tempdir where the unix socket will live
function generateSockfileName() {
  const randomId = Math.random().toString(36).substring(8);
  const tmpdir = mkdtempSync(
    path.join(os.tmpdir(), `prettier-ruby-${randomId}`)
  );

  return `${tmpdir}/ruby-parser-server.sock`;
}

// Spawns a parser server if it does not exist
function ensureParseServer(env) {
  if (SOCKFILE) {
    return;
  }

  SOCKFILE = generateSockfileName();

  spawnParserServer(SOCKFILE, env);
}

// Formats and sends a request for the parser server. We use netcat here since
// Prettier expects the results of `parse` to be synchrnous, and Node.js does
// not offer a mechanism for synchronous socket requests. Luckily, netcat is
// fairly ubuitious at this point.
function sendRequest(request, env) {
  const child = spawnSync("nc", ["-U", SOCKFILE], {
    env: Object.assign({}, process.env, env),
    input: JSON.stringify(request),
    maxBuffer: 15 * 1024 * 1024 // 15MB
  });

  const response = child.stdout.toString();

  if (response.match(/^ERROR: /)) {
    throw new Error(response);
  } else {
    return JSON.parse(response);
  }
}

module.exports = { sendRequest, ensureParseServer };
