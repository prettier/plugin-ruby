const prettier = require("prettier");

const checkFormat = (before, after, config) => {
  const options = Object.assign({}, { parser: "ruby", plugins: ["."] }, config);
  const actual = prettier.format(before, options);

  return {
    pass: actual === `${after}\n`,
    message: () => `Expected:\n${after}\nReceived:\n${actual}`
  };
};

expect.extend({
  toChangeFormat: (before, after, config = {}) => checkFormat(before, after, config),
  toMatchFormat: (format, config = {}) => checkFormat(format, format, config)
});
