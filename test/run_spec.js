const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const prettier = require("prettier");
const prettierRuby = require("../src/ruby");

const expectedMinitestFiles = [
  "alias.rb",
  "array.rb",
  "binary.rb",
  "next.rb",
  "numbers.rb",
  "kwargs.rb",
  "regexp.rb"
];

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

const eachTest = (dirname, config, callback) => fs.readdirSync(dirname).forEach(file => {
  if (prettierRuby.languages.some(language => language.extensions.includes(path.extname(file)))) {
    callback(file, () => format(path.join(dirname, file), config));
  }
});

const handleChildProcess = child => new Promise((resolve, reject) => (
  child.on("exit", code => {
    if (code === 0) {
      resolve();
    } else {
      reject((child.stdout.read() || child.stderr.read() || "").toString());
    }
  })
));

global.run_spec = (dirname) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'minitest-'));

  afterAll(() => {
    fs.readdirSync(tmpDir).forEach(file => {
      fs.unlinkSync(path.join(tmpDir, file));
    });
    fs.rmdirSync(tmpDir);
  });

  eachConfig((prettierConfig, rubocopConfig, config) => {
    describe(`for the ${prettierConfig} config`, () => {
      eachTest(dirname, config, (file, getContents) => {
        describe(file, () => {
          test(`matches expected output`, () => {
            expect(getContents()).toMatchSnapshot();
          });

          if (!process.env.NOLINT) {
            test(`generated code passes rubocop`, () => {
              const child = spawn("bundle", [
                "exec", "rubocop", "--stdin", file, "--config", rubocopConfig
              ]);

              if (process.env.VIOLATIONS) {
                  child.stdout.pipe(process.stdout);
              }

              child.stdin.write(getContents());
              child.stdin.end();

              return handleChildProcess(child);
            });
          }

          if (expectedMinitestFiles.includes(file)) {
            test(`generated code passes as a ruby test`, () => {
              const filepath = path.join(tmpDir, file);
              fs.writeFileSync(filepath, getContents());

              const child = spawn("bundle", [
                  "exec", "ruby", "test/jest_minitest.rb", tmpDir, file
              ]);

              return handleChildProcess(child);
            });
          } else {
            test.todo(`generated code passes as a ruby test`);
          }
        });
      });
    });
  });
}
