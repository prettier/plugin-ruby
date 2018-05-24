#!/usr/bin/env node

const fs = require("fs");
const prettier = require("prettier");

fs.readdirSync("./test").forEach(filename => {
  if (!filename.match(/.+\.rb$/)) {
    return;
  }

  test(`${filename} matches expected output`, done => {
    fs.readFile(`./test/${filename}`, "utf8", (error, code) => {
      if (error) {
        done.fail(error);
      }

      const formatted = prettier.format(code, { parser: "ruby", plugins: ["."] });
      expect(formatted).toMatchSnapshot();

      done();
    });
  });
});
