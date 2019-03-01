const fs = require("fs");
const prettier = require("prettier");

const format = (file) => prettier.format(fs.readFileSync(file, "utf8"), {
    parser: "ruby", plugins: ["."]
});

const eachError = (callback) => fs.readdirSync("./test/errors").forEach(file => {
    callback(file, () => format(`./test/errors/${file}`));
});

eachError((file, getContents) => {
    test(`${file} throws error on parsing`, () => {
        expect(getContents).toThrowError('Invalid ruby');
    });
});