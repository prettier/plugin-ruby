const { spawn, spawnSync } = require("child_process");
const path = require("path");
const prettier = require("prettier");
const readline = require("readline");

// Set RUBY_VERSION so certain tests only run for certain versions
const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
process.env.RUBY_VERSION = spawnSync("ruby", args).stdout.toString().trim();

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = prettier.__debug;

const parser = spawn("ruby", ["./test/js/parser.rb"]);

const rl = readline.createInterface({
  input: parser.stdout,
  output: parser.stdin
});

afterAll(() => {
  rl.close();
  parser.stdin.pause();
  parser.kill("SIGINT");
});

const realFormat = (content, config = {}) =>
  prettier.format(
    content,
    Object.assign({ parser: "ruby", plugins: ["."] }, config)
  );

const checkFormat = (before, after, config) =>
  new Promise((resolve) => {
    if (before.includes("#")) {
      // If the source includes an #, then this test has a comment in it.
      // Unfortunately, formatAST ignores comments and doesn't parse them at
      // all, so we can't call it and check against the output. In this case,
      // we need to instead go through the normal format function and spawn a
      // process.
      resolve(realFormat(before, config));
    } else {
      const opts = Object.assign({ parser: "ruby", plugins: ["."] }, config);

      rl.question(`${before}\n---\n`, (response) => {
        const { formatted } = formatAST(JSON.parse(response), opts);
        resolve(formatted);
      });
    }
  }).then((formatted) => ({
    pass: formatted === `${after}\n`,
    message: () => `Expected:\n${after}\nReceived:\n${formatted}`
  }));

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before, config);
  },
  toFailFormat(before, message) {
    let pass = false;
    let error = null;

    try {
      realFormat(before);
    } catch (caught) {
      error = caught;
      pass = caught.message === message;
    }

    return {
      pass,
      message: () => `
        Expected format to throw an error for ${before} with ${message},
        but got ${error.message} instead
      `
    };
  },
  toInferParser(filename) {
    const filepath = path.join(__dirname, filename);
    const plugin = path.join(__dirname, "..", "..", "src", "ruby");

    return prettier
      .getFileInfo(filepath, { plugins: [plugin] })
      .then((props) => ({
        pass: props.inferredParser === "ruby",
        message: () =>
          `Expected prettier to infer the ruby parser for ${filename}, but got ${props.inferredParser} instead`
      }));
  }
});
