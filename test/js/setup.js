const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");

const prettier = require("prettier");
const { formatAST } = prettier.__debug;

const parser = spawn("ruby", ["./test/js/parser.rb"]);
afterAll(() => parser.kill());

const rl = readline.createInterface({
  input: parser.stdout,
  output: parser.stdin
});

const checkFormat = (before, after, config) => new Promise(resolve => {
  const opts = Object.assign({ parser: "ruby", plugins: ["."] }, config);

  rl.question(`${before}\n---\n`, response => {
    const { formatted } = formatAST(JSON.parse(response), opts);

    resolve({
      pass: formatted === `${after}\n`,
      message: () => `Expected:\n${after}\nReceived:\n${formatted}`
    });
  });
});

const realFormat = content => prettier.format(content, {
  parser: "ruby", plugins: ["."]
});

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before, config);
  },
  toFailFormat(before) {
    let pass = false;

    try {
      realFormat(before);
    } catch (error) {
      pass = /Invalid ruby/g.test(error);
    }

    return {
      pass,
      message: () => `Expected format to throw an error for: ${before}`
    };
  }
});
