const { spawnSync } = require("child_process");
const path = require("path");

module.exports = (text, parsers, opts) => {
  const child = spawnSync("ruby", [path.join(__dirname, "./ripper.rb"), text]);

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const response = child.stdout.toString();
  return JSON.parse(response);
};
