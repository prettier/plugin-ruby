const { spawnSync } = require("child_process");
const path = require("path");

// In order to properly parse ruby code, we need to tell the ruby process to
// parse using UTF-8. Unfortunately, the way that you accomplish this looks
// differently depending on your platform. This object below represents all of
// the possible values of process.platform per:
//   https://nodejs.org/api/process.html#process_process_platform
const LANG = {
  aix: "C.UTF-8",
  darwin: "en_US.UTF-8",
  freebsd: "C.UTF-8",
  linux: "C.UTF-8",
  openbsd: "C.UTF-8",
  sunos: "C.UTF-8",
  win32: ".UTF-8"
}[process.platform];

module.exports = (text, _parsers, _opts) => {
  const child = spawnSync(
    "ruby",
    ["--disable-gems", path.join(__dirname, "./ripper.rb")],
    {
      env: Object.assign({}, process.env, { LANG }),
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
