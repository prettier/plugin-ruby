#!/usr/bin/env node

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const print = require("../src/print");
const nodes = require("../src/nodes");

const format = (file, config) => prettier.format(fs.readFileSync(file, "utf8"), {
  parser: "ruby", plugins: ["."], ...config
});

const eachConfig = callback => fs.readdirSync("./test/config").forEach(prettierConfig => {
  if (prettierConfig.match(/.+\.json$/)) {
    const rubocopConfig = `./test/config/${prettierConfig.slice(0, -5)}.yml`;
    const config = JSON.parse(fs.readFileSync(`./test/config/${prettierConfig}`, "utf8"));
    callback(prettierConfig, rubocopConfig, config);
  }
});

const eachTest = (config, callback) => fs.readdirSync("./test").forEach(file => {
  if (file.match(/.+\.rb$/)) {
    callback(file, () => format(`./test/${file}`, config));
  }
});

const eachError = (config, callback) => fs.readdirSync("./test/errors").forEach(file => {
  callback(file, () => format(`./test/errors/${file}`, config));
});

const eachUnsupportedNode = callback => {
  const child = spawnSync("ruby", ["-rripper", "-e", "puts Ripper::PARSER_EVENTS"]);

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const expected = [
    "arg_ambiguous",
    "heredoc_dedent",
    "magic_comment",
    "mlhs_new",
    "operator_ambiguous",
    "parse_error",
    ""
  ];

  const events = Object.keys(nodes).concat(expected);
  child.stdout.toString().split("\n").forEach(event => {
    if (events.indexOf(event) === -1) {
      callback(event);
    }
  });
};

eachConfig((prettierConfig, rubocopConfig, config) => {
  eachTest(config, (file, getContents) => {
    describe(file, () => {
      test(`matches expected output for ${prettierConfig}`, () => {
        expect(getContents()).toMatchSnapshot();
      });

      if (!process.env.NOLINT) {
        test(`generated code passes rubocop for ${prettierConfig}`, () => new Promise((resolve, reject) => {
          const child = spawn("bundle", ["exec", "rubocop", "--stdin", file, "--config", rubocopConfig]);

          if (process.env.VIOLATIONS) {
            child.stdout.pipe(process.stdout);
          }

          child.stdin.write(getContents());
          child.stdin.end();

          child.on("exit", resolve);
        }));
      }
    });
  });

  eachError(config, (file, getContents) => {
    test(`${file} throws error on parsing`, () => {
      expect(getContents).toThrowError();
    });
  });
});

eachUnsupportedNode(event => {
  test.todo(`handles the ${event} event`);
});

test("when encountering an unsupported node type", () => {
  const path = { getValue: () => ({ type: "unsupported", body: {} }) };

  expect(() => print(path)).toThrow("Unsupported");
});
