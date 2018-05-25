#!/usr/bin/env node

const fs = require("fs");
const prettier = require("prettier");
const print = require("../src/print");

fs.readdirSync("./test/config").forEach(configFilename => {
  const config = JSON.parse(fs.readFileSync(`./test/config/${configFilename}`, "utf8"));

  fs.readdirSync("./test").forEach(filename => {
    if (!filename.match(/.+\.rb$/)) {
      return;
    }

    test(`${filename} matches expected output for ${configFilename}`, done => {
      fs.readFile(`./test/${filename}`, "utf8", (error, code) => {
        if (error) {
          done.fail(error);
        }

        const formatted = prettier.format(code, {
          parser: "ruby", plugins: ["."], ...config
        });
        expect(formatted).toMatchSnapshot();

        done();
      });
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
