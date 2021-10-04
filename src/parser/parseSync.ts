import { spawn, spawnSync } from "child_process";
import {
  existsSync,
  unlinkSync,
  mkdtempSync,
  copyFileSync,
  mkdirSync,
  rmdirSync
} from "fs";
import os from "os";
import path from "path";
import process from "process";

type ParserArgs = { cmd: string; args: string[] };
let parserArgs: undefined | ParserArgs;

if (process.env.PRETTIER_RUBY_HOST) {
  const [cmd, ...args] = process.env.PRETTIER_RUBY_HOST.split(" ");
  parserArgs = { cmd, args };
}

// In order to properly parse ruby code, we need to tell the ruby process to
// parse using UTF-8. Unfortunately, the way that you accomplish this looks
// differently depending on your platform.
/* istanbul ignore next */
export function getLang() {
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
    android: "C.UTF-8",
    cygwin: "C.UTF-8",
    darwin: "en_US.UTF-8",
    freebsd: "C.UTF-8",
    haiku: "C.UTF-8",
    linux: "C.UTF-8",
    netbsd: "C.UTF-8",
    openbsd: "C.UTF-8",
    sunos: "C.UTF-8",
    win32: ".UTF-8"
  }[platform];
}

// Generate the filepath that should be used to communicate the connection
// information between this process and the parser server.
export function getInfoFilepath() {
  return path.join(os.tmpdir(), `prettier-ruby-parser-${process.pid}.info`);
}

// Create a file that will act as a communication mechanism, spawn a parser
// server with that filepath as an argument, then spawn another process that
// will read that information in order to enable us to connect to it in the
// spawnSync function.
function spawnServer(): ParserArgs {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "prettier-plugin-ruby-"));
  const filepath = getInfoFilepath();

  let serverRbPath = path.join(__dirname, "./server.rb");
  let getInfoJsPath = path.join(__dirname, "./getInfo.js");
  let cleanupTempFiles: () => void | undefined;

  if (runningInPnPZip()) {
    // If we're running in a Yarn PnP environment inside a ZIP file, it's not possible to run
    // the Ruby server or the getInfo.js script directly.  Instead, we need to copy them and all
    // the files they depend on to a temporary directory.

    const sourceFiles = [
      "parser/server.rb",
      "parser/getInfo.js",
      "parser/netcat.js",
      "ruby/parser.rb",
      "rbs/parser.rb",
      "haml/parser.rb"
    ];
    serverRbPath = path.join(tempDir, "parser", "server.rb");
    getInfoJsPath = path.join(tempDir, "parser", "getInfo.js");

    sourceFiles.forEach((rubyFile) => {
      const destDir = path.join(tempDir, path.dirname(rubyFile));
      if (!existsSync(destDir)) {
        mkdirSync(destDir);
      }
      copyFileSync(
        path.join(__dirname, "..", rubyFile),
        path.join(tempDir, rubyFile)
      );
    });

    cleanupTempFiles = () => {
      [
        getInfoJsPath,
        ...sourceFiles.map((rubyFile) => path.join(tempDir, rubyFile))
      ].forEach((tmpFilePath) => {
        if (existsSync(tmpFilePath)) {
          unlinkSync(tmpFilePath);
        }
      });

      sourceFiles.forEach((rubyFile) => {
        const tempSubdir = path.join(tempDir, path.dirname(rubyFile));
        if (existsSync(tempSubdir)) {
          rmdirSync(tempSubdir);
        }
      });

      if (existsSync(tempDir)) {
        rmdirSync(tempDir);
      }
    };
  }

  const server = spawn("ruby", [serverRbPath, filepath], {
    env: Object.assign({}, process.env, { LANG: getLang() }),
    detached: true,
    stdio: "inherit"
  });

  server.unref();
  process.on("exit", () => {
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }

    if (cleanupTempFiles != null) {
      cleanupTempFiles();
    }

    try {
      if (server.pid) {
        process.kill(-server.pid);
      }
    } catch (e) {
      if (process.env.PLUGIN_RUBY_CI) {
        throw new Error(`Failed to kill the parser server: ${e}`);
      }
    }
  });

  const info = spawnSync("node", [getInfoJsPath, filepath]);

  if (info.status !== 0) {
    throw new Error(`
      We failed to spawn our parser server. Please report this error on GitHub
      at https://github.com/prettier/plugin-ruby. The error message was:

        ${info.stderr.toString()}.
    `);
  }

  const [cmd, ...args] = info.stdout.toString().split(" ");
  return { cmd, args };
}

// If we're in a yarn Plug'n'Play environment, then the relative paths being
// used by the parser server and the various scripts used to communicate
// therein are not going to work with its virtual file system.
function runningInPnPZip() {
  return process.versions.pnp && __dirname.includes(".zip");
}

// You can optionally return location information from the source string when
// raising an error that prettier will handle for you nicely.
type LocatedError = Error & { loc?: any };

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
function parseSync(parser: string, source: string) {
  if (!parserArgs) {
    parserArgs = spawnServer();
  }

  const response = spawnSync(parserArgs.cmd, parserArgs.args, {
    input: `${parser}|${source}`,
    maxBuffer: 15 * 1024 * 1024
  });

  const stdout = response.stdout.toString();
  const stderr = response.stderr.toString();
  const { status } = response;

  // If we didn't receive anything over stdout or we have a bad exit status,
  // then throw whatever we can.
  if (stdout.length === 0 || (status !== null && status !== 0)) {
    throw new Error(stderr || "An unknown error occurred");
  }

  const parsed = JSON.parse(stdout);

  if (parsed.error) {
    const error: LocatedError = new Error(parsed.error);
    if (parsed.loc) {
      error.loc = parsed.loc;
    }

    throw error;
  }

  return parsed;
}

export default parseSync;
