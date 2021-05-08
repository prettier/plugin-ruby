const { spawn, spawnSync, execSync } = require("child_process");
const { existsSync, mkdtempSync } = require("fs");
const os = require("os");
const path = require("path");
const process = require("process");

let sockfile = process.env.PRETTIER_RUBY_HOST;
let netcat;

// In order to properly parse ruby code, we need to tell the ruby process to
// parse using UTF-8. Unfortunately, the way that you accomplish this looks
// differently depending on your platform.
/* istanbul ignore next */
function getLang() {
  const { env, platform } = process;
  const envValue = env.LC_ALL || env.LC_CTYPE || env.LANG;

  // If an env var is set for the locale that already includes UTF-8 in the
  // name, then assume we can go with that.
  if (envValue && envValue.includes("UTF-8")) {
    return envValue;
  }

  // Otherwise, we're going to guess which encoding to use based on the system.
  // This is probably not the best approach in the world, as you could be on
  // linux and not have C.UTF-8, but in that case you're probably passing an env
  // var for it. This object below represents all of the possible values of
  // process.platform per:
  // https://nodejs.org/api/process.html#process_process_platform
  return {
    aix: "C.UTF-8",
    darwin: "en_US.UTF-8",
    freebsd: "C.UTF-8",
    linux: "C.UTF-8",
    openbsd: "C.UTF-8",
    sunos: "C.UTF-8",
    win32: ".UTF-8"
  }[platform];
}

// Spawn the parser.rb subprocess. We do this since booting Ruby is slow, and we
// can re-use the parser process multiple times since it is statelesss.
function spawnParseServer() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "prettier-ruby"));
  const tmpFile = path.join(tmpDir, `${process.pid}.sock`);

  const server = spawn("ruby", [path.join(__dirname, "./server.rb"), tmpFile], {
    env: Object.assign({}, process.env, { LANG: getLang() }),
    detached: true,
    stdio: "inherit"
  });

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
  while (!existsSync(tmpFile) && new Date() - now < 3000) {
    execSync("sleep 0.1");
  }

  return tmpFile;
}

// Checks to see if an executable is available.
function hasCommand(name) {
  let result;

  if (os.type() === "Windows_NT") {
    result = spawnSync("where", [name]);
  } else {
    result = spawnSync("command", ["-v", name]);
  }

  return result.status === 0;
}

// Finds a netcat-like adapter to use for sending data to a socket. We order
// these by likelihood of being found so we can avoid some shell-outs.
function findNetcat(opts) {
  if (opts.rubyNetcatCommand) {
    const splits = opts.rubyNetcatCommand.split(" ");
    return { command: splits[0], args: splits.slice(1) };
  }

  if (hasCommand("nc")) {
    return { command: "nc", args: ["-U"] };
  }

  if (hasCommand("telnet")) {
    return { command: "telnet", args: ["-u"] };
  }

  if (hasCommand("ncat")) {
    return { command: "ncat", args: ["-U"] };
  }

  if (hasCommand("socat")) {
    return { command: "socat", args: ["-"] };
  }

  return { command: "node", args: [require.resolve("./netcat.js")] };
}

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
function parseSync(parser, source, opts) {
  if (!sockfile) {
    sockfile = spawnParseServer();
  }

  if (!netcat) {
    netcat = findNetcat(opts);
  }

  const response = spawnSync(netcat.command, netcat.args.concat(sockfile), {
    input: `${parser}|${source}`,
    maxBuffer: 15 * 1024 * 1024
  });

  const stdout = response.stdout.toString();
  const stderr = response.stderr.toString();
  const { status } = response;

  // We need special handling in case the user's version of nc doesn't support
  // using unix sockets.
  if (
    stderr.includes("invalid option -- U") ||
    stderr.includes("invalid option -- 'u'") ||
    stderr.includes("Protocol not supported")
  ) {
    throw new Error(`
      @prettier/plugin-ruby uses unix sockets to communicate between the node.js
      process running prettier and an underlying Ruby process used for parsing.
      Unfortunately the command that it tried to use to do that
      (${netcat.command}) does not support unix sockets. To solve this either
      uninstall the version of ${netcat.command} that you're using and use a
      different implementation, or change the value of the rubyNetcatCommand
      option in your prettier configuration.
    `);
  }

  // If we didn't receive anything over stdout or we have a bad exit status,
  // then throw whatever we can.
  if (stdout.length === 0 || (status !== null && status !== 0)) {
    throw new Error(stderr || "An unknown error occurred");
  }

  const parsed = JSON.parse(stdout);

  if (parsed.error) {
    const error = new Error(parsed.error);
    if (parsed.loc) {
      error.loc = parsed.loc;
    }

    throw error;
  }

  return parsed;
}

module.exports = parseSync;
