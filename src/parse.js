import { spawn } from "child_process";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import process from "process";
import url from "url";

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

// Return the list of plugins that should be passed to the server process.
function getPlugins(opts) {
  const plugins = new Set();

  const rubyPlugins = opts.rubyPlugins.trim();
  if (rubyPlugins.length > 0) {
    rubyPlugins.split(",").forEach((plugin) => plugins.add(plugin.trim()));
  }

  if (opts.rubySingleQuote) {
    plugins.add("plugin/single_quotes");
  }

  if (opts.trailingComma !== "none") {
    plugins.add("plugin/trailing_comma");
  }

  return Array.from(plugins);
}

// Create a file that will act as a communication mechanism, spawn a parser
// server with that filepath as an argument, then wait for the file to be
// created that will contain the connection information.
export async function spawnServer(opts, killOnExit = true) {
  const tmpdir = os.tmpdir();
  let serverFilepath = url.fileURLToPath(
    new URL("./server.rb", import.meta.url)
  );

  // If we're in a yarn Plug'n'Play environment, then the relative paths being
  // used by the parser server are not going to work with its virtual file
  // system.
  if (process.versions.pnp) {
    if (url.fileURLToPath(new URL(".", import.meta.url)).includes(".zip")) {
      // TODO: wait for prettier to get support back for pnp
    }
  }

  const filepath = path.join(
    tmpdir,
    `prettier-ruby-parser-${process.pid}.info`
  );
  const server = spawn(
    "ruby",
    [serverFilepath, `--plugins=${getPlugins(opts).join(",")}`, filepath],
    {
      env: Object.assign({}, process.env, { LANG: getLang() }),
      stdio: "ignore",
      detached: true
    }
  );

  server.unref();

  if (killOnExit) {
    process.on("exit", () => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      try {
        if (server.pid) {
          // Kill the server process if it's still running. If we're on windows
          // we're going to use the process ID number. If we're not, we're going
          // to use the negative process ID to indicate the group.
          const pid = process.platform === "win32" ? server.pid : -server.pid;
          process.kill(pid);
        }
      } catch (error) {
        // If there's an error killing the process, we're going to ignore it.
      }
    });
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => {
        clearInterval(interval);
        reject(
          new Error(
            "Failed to get connection options from parse server in time. If this happens repeatedly, try increasing the PRETTIER_RUBY_TIMEOUT_MS environment variable beyond 5000."
          )
        );
      },
      parseInt(process.env.PRETTIER_RUBY_TIMEOUT_MS || "5000", 10)
    );

    const interval = setInterval(() => {
      if (fs.existsSync(filepath)) {
        resolve({
          serverPID: server.pid,
          connectionFilepath: filepath,
          connectionOptions: JSON.parse(
            fs.readFileSync(filepath).toString("utf-8")
          )
        });

        clearTimeout(timeout);
        clearInterval(interval);
      }
    }, 100);
  });
}

let connectionOptions;
if (process.env.PRETTIER_RUBY_HOST) {
  connectionOptions = JSON.parse(process.env.PRETTIER_RUBY_HOST);
}

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
export async function parse(parser, source, opts) {
  if (!connectionOptions) {
    const spawnedServer = await spawnServer(opts);
    connectionOptions = spawnedServer.connectionOptions;
  }

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.on("error", reject);
    socket.on("data", (data) => {
      const response = JSON.parse(data.toString("utf-8"));

      if (response.error) {
        const error = new Error(response.error);
        if (response.loc) {
          error.loc = response.loc;
        }

        reject(error);
      }

      resolve(response);
    });

    socket.connect(connectionOptions, () => {
      socket.end(
        JSON.stringify({
          parser,
          source,
          maxwidth: opts.printWidth,
          tabwidth: opts.tabWidth
        })
      );
    });
  });
}
