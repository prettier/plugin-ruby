const { spawnSync } = require("child_process");
const os = require("os");

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

// Finds an netcat-like adapter to use for sending data to a socket. We order
// these by likelihood of being found so we can avoid some shell-outs.
function getCommandAndArgs() {
  if (hasCommand("nc")) {
    return ["nc", ["-U"]];
  }

  if (hasCommand("telnet")) {
    return ["telnet", ["-u"]];
  }

  if (hasCommand("ncat")) {
    return ["ncat", ["-U"]];
  }

  if (hasCommand("socat")) {
    return ["socat", ["-"]];
  }

  return ["node", [require.resolve("./netcat.js")]];
}

let command;
let args;

function getNetcat(opts) {
  if (!command) {
    if (opts.rubyNetcatCommand) {
      const splits = opts.rubyNetcatCommand.split(" ");

      command = splits[0];
      args = splits.slice(1);
    } else {
      [command, args] = getCommandAndArgs();
    }
  }

  return { command, args };
}

module.exports = getNetcat;
