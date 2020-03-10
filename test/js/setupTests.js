const { spawn, spawnSync } = require("child_process");
const path = require("path");
const prettier = require("prettier");
const readline = require("readline");

// Set RUBY_VERSION so certain tests only run for certain versions
const args = ["--disable-gems", "-e", "puts RUBY_VERSION"];
process.env.RUBY_VERSION = spawnSync("ruby", args)
  .stdout.toString()
  .trim();

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = prettier.__debug;

const parser = spawn("ruby", ["./test/js/parser.rb"]);
afterAll(() => parser.kill());

const rl = readline.createInterface({
  input: parser.stdout,
  output: parser.stdin
});

const checkFormat = (before, after, config) =>
  new Promise(resolve => {
    const opts = Object.assign({ parser: "ruby", plugins: ["."] }, config);

    rl.question(`${before}\n---\n`, response => {
      const { formatted } = formatAST(JSON.parse(response), opts);

      resolve({
        pass: formatted === `${after}\n`,
        message: () => `Expected:\n${after}\nReceived:\n${formatted}`
      });
    });
  });

const realFormat = content =>
  prettier.format(content, {
    parser: "ruby",
    plugins: ["."]
  });

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
  toInferRubyParser(filename) {
    const filepath = path.join(__dirname, filename);
    const plugin = path.join(__dirname, "..", "..", "src", "ruby");

    return prettier
      .getFileInfo(filepath, { plugins: [plugin] })
      .then(({ inferredParser }) => ({
        pass: inferredParser === "ruby",
        message: () => `
          Expected prettier to infer the ruby parser for ${filename},
          but got ${inferredParser} instead
        `
      }));
  }
});

const checkHamlFormat = (before, after, config) => {
  const formatted = prettier.format(
    before,
    Object.assign({}, config, { parser: "haml", plugins: ["."] })
  );

  return {
    pass: formatted === `${after}\n`,
    message: () => `Expected:\n${after}\nReceived:\n${formatted}`
  };
};

expect.extend({
  toChangeHamlFormat(before, after, config = {}) {
    return checkHamlFormat(before, after, config);
  },
  toMatchHamlFormat(before, config = {}) {
    return checkHamlFormat(before, before, config);
  }
});
