const net = require("net");
const path = require("path");
const prettier = require("prettier");

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = prettier.__debug;

function parseAsync(text) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setTimeout(10 * 1000, () => {
      client.destroy();
      reject(new Error("Connection to the server timed out."));
    });

    client.on("error", (error) => {
      client.destroy();
      reject(error);
    });

    client.on("end", () => {
      client.destroy();
      reject(new Error("Server closed the connection."));
    });

    client.on("data", (data) => {
      client.destroy();
      resolve(JSON.parse(data.toString()));
    });

    client.connect({ port: 22020 }, () => {
      client.end(text);
    });
  });
}

function checkFormat(before, after, config) {
  const opts = Object.assign(
    { parser: "ruby", plugins: ["."], originalText: before },
    config
  );

  return new Promise((resolve, reject) => {
    if (before.includes("#") || before.includes("=begin")) {
      // If the source includes an #, then this test has a comment in it.
      // Unfortunately, formatAST expects comments to already be attached, but
      // prettier doesn't export anything that allows you to hook into their
      // attachComments function. So in this case, we need to instead go through
      // the normal format function and spawn a process.
      resolve(prettier.format(before, opts));
    } else {
      parseAsync(before)
        .then((ast) => resolve(formatAST(ast, opts).formatted))
        .catch(reject);
    }
  })
    .then((formatted) => ({
      pass: formatted === `${after}\n`,
      message: () => `Expected:\n${after}\nReceived:\n${formatted}`
    }))
    .catch((error) => ({
      pass: false,
      message: () => error.message
    }));
}

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before, config);
  },
  toFailFormat(before, message) {
    let pass = false;
    let error = null;

    try {
      prettier.format(before, { parser: "ruby", plugins: ["."] });
    } catch (caught) {
      error = caught;
      pass = caught.message === message;
    }

    return {
      pass,
      message: () => `
        Expected format to throw an error for ${before} with ${message},
        but got ${error.message} instead
      `
    };
  },
  toInferParser(filename) {
    const filepath = path.join(__dirname, filename);
    const plugin = path.join(__dirname, "..", "..", "src", "ruby");

    return prettier
      .getFileInfo(filepath, { plugins: [plugin] })
      .then((props) => ({
        pass: props.inferredParser === "ruby",
        message: () =>
          `Expected prettier to infer the ruby parser for ${filename}, but got ${props.inferredParser} instead`
      }));
  }
});
