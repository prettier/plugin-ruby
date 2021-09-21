import net from "net";
import prettier from "prettier";

import type { Plugin } from "../../src/types";
import type { Code } from "./types";
import plugin from "../../src/plugin";

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = (prettier as any).__debug;

function parseAsync(parser: string, source: string) {
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

    client.connect(process.env.PRETTIER_RUBY_HOST || "", () => {
      client.end(`${parser}|${source}`);
    });
  });
}

function checkFormat(before: Code, after: Code, config: Partial<Plugin.Options>) {
  const parser = (before as any).parser || "ruby";
  const originalText = (before as any).code || before;

  const opts = Object.assign({ parser, plugins: [plugin], originalText }, config);

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
      pass: (formatted as string).replace(/\r\n/g, "\n") === `${after}\n`,
      message: () => `Expected:\n${after}\nReceived:\n${formatted}`
    }))
    .catch((error) => ({
      pass: false,
      message: () => error.message
    }));
}

expect.extend({
  toChangeFormat(before: Code, after: Code, config: Partial<Plugin.Options> = {}) {
    return checkFormat(before, (after as any).code || after, config);
  },
  toMatchFormat(before: Code, config: Partial<Plugin.Options> = {}) {
    return checkFormat(before, (before as any).code || before, config);
  }
});

declare global {
  namespace jest {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toChangeFormat(_after: Code, _config?: Partial<Plugin.Options>): Promise<CustomMatcherResult>;
      toMatchFormat(_config?: Partial<Plugin.Options>): Promise<CustomMatcherResult>;
    }
  }
}
