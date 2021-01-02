const { spawnSync } = require("child_process");
const path = require("path");

// In order to properly parse ruby code, we need to tell the ruby process to
// parse using UTF-8. Unfortunately, the way that you accomplish this looks
// differently depending on your platform.
const LANG = (() => {
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
})();

// This function is responsible for taking an input string of text and returning
// to prettier a JavaScript object that is the equivalent AST that represents
// the code stored in that string. We accomplish this by spawning a new Ruby
// process of parser.rb and reading JSON off STDOUT.
function parse(text, _parsers, _opts) {
  const child = spawnSync(
    "ruby",
    ["--disable-gems", path.join(__dirname, "./parser.rb")],
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
}

const pragmaPattern = /#\s*@(prettier|format)/;

// This function handles checking whether or not the source string has the
// pragma for prettier. This is an optional workflow for incremental adoption.
function hasPragma(text) {
  return pragmaPattern.test(text);
}

// This function is critical for comments and cursor support, and is responsible
// for returning the index of the character within the source string that is the
// beginning of the given node.
function locStart(node) {
  return node.char_start;
}

// This function is critical for comments and cursor support, and is responsible
// for returning the index of the character within the source string that is the
// ending of the given node.
function locEnd(node) {
  return node.char_end;
}

module.exports = {
  parse,
  astFormat: "ruby",
  hasPragma,
  locStart,
  locEnd
};
