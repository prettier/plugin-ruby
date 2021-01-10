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
function getCommandAndArg() {
  if (hasCommand("nc")) {
    return ["nc", "-U"];
  }

  if (hasCommand("telnet")) {
    return ["telnet", "-u"];
  }

  if (hasCommand("ncat")) {
    return ["ncat", "-U"];
  }

  if (hasCommand("socat")) {
    return ["socat", "-"];
  }

  return ["node", require.resolve("./netcat.js")];
}

let command;
let arg;

function getNetcat() {
  if (!command) {
    [command, arg] = getCommandAndArg();
  }

  return { command, arg };
}

module.exports = getNetcat;
