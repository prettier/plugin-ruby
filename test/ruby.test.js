#!/usr/bin/env node

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const print = require("../src/print");

const rubocop = text => new Promise((resolve, reject) => {
  const child = spawn("bundle", ["exec", "rubocop", "--stdin", "/dev/null"]);

  if (process.env.VIOLATIONS) {
    child.stdout.pipe(process.stdout);
  }

  child.stdin.write(text);
  child.stdin.end();

  child.on("exit", resolve);
});

fs.readdirSync("./test/config").forEach(configFilename => {
  const config = JSON.parse(fs.readFileSync(`./test/config/${configFilename}`, "utf8"));

  fs.readdirSync("./test").forEach(filename => {
    if (!filename.match(/.+\.rb$/)) {
      return;
    }

    const text = fs.readFileSync(`./test/${filename}`, "utf8");

    describe(filename, () => {
      test(`matches expected output for ${configFilename}`, () => {
        const code = prettier.format(text, { parser: "ruby", plugins: ["."], ...config });
        expect(code).toMatchSnapshot();
      });

      test.skip("generated code passes rubocop", () => {
        return rubocop(text).then(code => {
          expect(code).toEqual(0);
        });
      });
    });
  });

  fs.readdirSync("./test/errors").forEach(filename => {
    const text = fs.readFileSync(`./test/errors/${filename}`, "utf8");

    test(`${filename} throws error on parsing`, () => {
      expect(() => { prettier.format(text, { parser: "ruby", plugins: ["."], ...config }) }).toThrowError();
    });
  });
});

test("when encountering an unsupported node type", () => {
  const path = {
    getValue: () => path.value,
    value: { type: "unsupported", body: {} }
  };

  expect(() => print(path, null, null)).toThrow("Unsupported");
});

const getUnhandled = () => {
  const child = spawnSync("ruby", ["-e", "require 'ripper'; puts Ripper::PARSER_EVENTS"]);

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
    "stmts_new",
    ""
  ];

  const events = Object.keys(print.nodes).concat(expected);
  return child.stdout.toString().split("\n").filter(event => (
    events.indexOf(event) === -1
  ));
};

getUnhandled().forEach(event => {
  test.todo(`handles the ${event} event`);
});
