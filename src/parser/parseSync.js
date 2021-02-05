const requestParse = require("./requestParse");

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
function parseSync(parser, source) {
  const { stdout, stderr, status } = requestParse(parser, source);

  if (stdout.length === 0 || (status !== null && status !== 0)) {
    throw new Error(stderr || "An unknown error occurred");
  }

  const parsed = JSON.parse(stdout);

  if (parsed.error) {
    const error = new Error(parsed.error);
    if (parsed.loc) {
      error.loc = parsed.loc;
    }

    throw error;
  }

  return parsed;
}

module.exports = parseSync;
