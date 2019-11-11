const { spawnSync } = require("child_process");
const path = require("path");

const parse = (text, _parsers, _opts) => {
  const child = spawnSync("ruby", [path.join(__dirname, "./parse.rb")], {
    input: text
  });

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const response = child.stdout.toString();
  return JSON.parse(response);
};

module.exports = parse;
