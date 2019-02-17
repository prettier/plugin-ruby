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

const eachTest = (config, callback) => fs.readdirSync("./test/cases").forEach(file => {
  callback(file, () => format(`./test/cases/${file}`, config));
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
    "args_add",
    "args_new",
    "heredoc_dedent",
    "magic_comment",
    "mlhs_add",
    "mlhs_new",
    "mrhs_add",
    "mrhs_new",
    "operator_ambiguous",
    "parse_error",
    "qsymbols_add",
    "qsymbols_new",
    "qwords_add",
    "qwords_new",
    "regexp_add",
    "regexp_new",
    "stmts_add",
    "stmts_new",
    "string_add",
    "string_content",
    "symbols_add",
    "symbols_new",
    "void_stmt",
    "words_add",
    "words_new",
    "xstring_add",
    "xstring_new",
    ""
  ];

  const events = Object.keys(nodes).concat(expected);
  child.stdout.toString().split("\n").forEach(event => {
    if (events.indexOf(event) === -1) {
      callback(event);
    }
  });
};

const handleChildProcess = child => new Promise((resolve, reject) => child.on("exit", code => {
  if (code === 0) {
    resolve();
  } else {
    reject((child.stdout.read() || child.stderr.read() || "").toString());
  }
}));

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync("minitest-");
});

afterAll(() => {
  fs.readdirSync(tmpDir).forEach(file => {
    fs.unlinkSync(path.join(tmpDir, file));
  });

  fs.rmdirSync(tmpDir);
});

eachConfig((prettierConfig, rubocopConfig, config) => {
  eachTest(config, (file, getContents) => {
    describe(file, () => {
      test(`matches expected output for ${prettierConfig}`, () => {
        expect(getContents()).toMatchSnapshot();
      });

      if (!process.env.NOLINT) {
        test(`generated code passes rubocop for ${prettierConfig}`, () => {
          const child = spawn("bundle", ["exec", "rubocop", "--stdin", file, "--config", rubocopConfig]);

          if (process.env.VIOLATIONS) {
            child.stdout.pipe(process.stdout);
          }

          child.stdin.write(getContents());
          child.stdin.end();

          return handleChildProcess(child);
        });
      }

      if (["alias.rb", "regexp.rb"].includes(file)) {
        test(`generated code passes as a ruby test for ${prettierConfig}`, () => {
          const filepath = path.join(tmpDir, file);
          fs.writeFileSync(filepath, getContents());

          const child = spawn("bundle", ["exec", "ruby", "test/minitest.rb", tmpDir, file]);
          return handleChildProcess(child);
        });
      } else {
        test.todo(`generated code passes as a ruby test for ${prettierConfig}`);
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
  test(`handles the ${event} event`, () => {
    expect(event).toEqual("handled");
  });
});

test("when encountering an unsupported node type", () => {
  const path = { getValue: () => ({ type: "unsupported", body: {} }) };

  expect(() => print(path)).toThrow("Unsupported");
});
