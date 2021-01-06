const net = require("net");
const path = require("path");
const prettier = require("prettier");

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = prettier.__debug;

function parseAsync(parser, text) {
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

      const response = JSON.parse(data.toString());
      (response.error ? reject : resolve)(response);
    });

    client.connect(process.env.PRETTIER_RUBY_PARSER_HOST, () => {
      client.end(`${parser}|${text}`);
    });
  });
}

function checkFormat(before, after, config) {
  const parser = before.parser || "ruby";
  const originalText = before.code || before;

  const opts = Object.assign({ parser, plugins: ["."], originalText }, config);

  return new Promise((resolve, reject) => {
    if (
      opts.parser === "ruby" &&
      (originalText.includes("#") || originalText.includes("=begin"))
    ) {
      // If the source includes an #, then this test has a comment in it.
      // Unfortunately, formatAST expects comments to already be attached, but
      // prettier doesn't export anything that allows you to hook into their
      // attachComments function. So in this case, we need to instead go through
      // the normal format function and spawn a process.
      resolve(prettier.format(originalText, opts));
    } else {
      parseAsync(opts.parser, originalText)
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
    return checkFormat(before, after.code || after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before.code || before, config);
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
    const plugin = path.join(__dirname, "..", "..", "src", "plugin");

    return prettier
      .getFileInfo(filepath, { plugins: [plugin] })
      .then((props) => ({
        pass: props.inferredParser === "ruby",
        message: () =>
          `Expected prettier to infer the ruby parser for ${filename}, but got ${props.inferredParser} instead`
      }));
  }
});

// For some reason, the process.on('exit') handler does not get called in jest specs even when the process exits. To remedy this, we emit a custom event.
afterAll(() => process.emit("exit"));
