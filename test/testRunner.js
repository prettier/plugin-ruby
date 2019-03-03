const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const minitestFiles = [
  "alias.rb",
  "array.rb",
  "assign.rb",
  "binary.rb",
  "next.rb",
  "numbers.rb",
  "kwargs.rb",
  "regexp.rb"
];

const asyncProcess = child => new Promise((resolve, reject) => (
  child.on("exit", code => {
    if (code === 0) {
      resolve();
    } else {
      reject((child.stdout.read() || child.stderr.read() || "").toString());
    }
  })
));

global.runCase = (filename, prettierConfig = {}, rubocopConfig = "default.yml") => {
  const file = path.join(__dirname, "cases", filename);
  const contents = prettier.format(fs.readFileSync(file, "utf8"), {
    parser: "ruby", plugins: ["."], ...prettierConfig
  });

  describe(filename, () => {
    test("matches expected output", () => {
      expect(contents).toMatchSnapshot();
    });

    if (!process.env.NOLINT) {
      test("generated code passes rubocop", () => {
        const child = spawn("bundle", [
          "exec", "rubocop", "--stdin", file, "--config", `test/config/${rubocopConfig}`
        ]);

        child.stdin.write(contents);
        child.stdin.end();

        return asyncProcess(child);
      });
    }

    if (minitestFiles.includes(filename)) {
      test("generated code passes as a ruby test", () => {
        const filepath = `${file.slice(0, -3)}.fmt.rb`;
        fs.writeFileSync(filepath, contents);

        const child = spawn("bundle", ["exec", "ruby", "test/minitest.rb", filepath]);
        return asyncProcess(child).finally(() => fs.unlinkSync(filepath));
      });
    } else {
      test.todo("generated code passes as a ruby test");
    }
  });
};
