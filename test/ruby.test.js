#!/usr/bin/env node

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const print = require("../src/print");
const nodes = require("../src/nodes");

const format = (contents, config) => prettier.format(contents, {
  parser: "ruby", plugins: ["."], ...config
});

const eachConfig = callback => fs.readdirSync("./test/config").forEach(prettierConfig => {
  if (prettierConfig.match(/.+\.json$/)) {
    const rubocopConfig = `./test/config/${prettierConfig.slice(0, -5)}.yml`;
    const config = JSON.parse(fs.readFileSync(`./test/config/${prettierConfig}`, "utf8"));
    callback(prettierConfig, rubocopConfig, config);
  }
});

const eachTest = callback => fs.readdirSync("./test").forEach(file => {
  if (file.match(/.+\.rb$/)) {
    const contents = fs.readFileSync(`./test/${file}`, "utf8");
    callback(file, contents);
  }
});

const eachError = callback => fs.readdirSync("./test/errors").forEach(file => {
  const contents = fs.readFileSync(`./test/errors/${file}`, "utf8");
  callback(file, contents);
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

const rubocopSkip = [
  "array.rb",
  "assign.rb",
  "binary.rb",
  "blocks.rb",
  "break.rb",
  "case.rb",
  "hash.rb",
  "kwargs.rb",
  "layout.rb",
  "method.rb",
  "next.rb",
  "return.rb",
  "strings.rb",
  "while.rb"
];

eachConfig((prettierConfig, rubocopConfig, config) => {
  eachTest((file, contents) => {
    describe(file, () => {
      test(`matches expected output for ${prettierConfig}`, () => {
        expect(format(contents, config)).toMatchSnapshot();
      });

      if (rubocopSkip.includes(file)) {
        test.skip(`generated code passes rubocop for ${prettierConfig}`, () => {});
      } else {
        test(`generated code passes rubocop for ${prettierConfig}`, () => new Promise((resolve, reject) => {
          const child = spawn("bundle", ["exec", "rubocop", "--stdin", file, "--config", rubocopConfig]);

          if (process.env.VIOLATIONS) {
            child.stdout.pipe(process.stdout);
          }

          child.stdin.write(format(contents, config));
          child.stdin.end();

          child.on("exit", resolve);
        }));
      }
    });
  });

  eachError((file, contents) => {
    test(`${file} throws error on parsing`, () => {
      expect(() => format(contents, config)).toThrowError();
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
