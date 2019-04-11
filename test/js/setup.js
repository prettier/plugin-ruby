const { spawn } = require("child_process");
const path = require("path");
const { formatAST } = require("prettier").__debug;
const readline = require("readline");

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

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(format, config = {}) {
    return checkFormat(format, format, config);
  }
});
