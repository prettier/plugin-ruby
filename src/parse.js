const { spawnSync } = require("child_process");
const path = require("path");

module.exports = (text, _parsers, _opts) => {
  const child = spawnSync(
    "ruby",
    ["--disable-gems", path.join(__dirname, "./ripper.rb")],
    {
      input: text,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    }
  );

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const response = child.stdout.toString();
  return JSON.parse(response);
};
