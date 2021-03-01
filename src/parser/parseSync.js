const requestParse = require("./requestParse");

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
function parseSync(parser, source, opts) {
  const { stdout, stderr, status } = requestParse(parser, source, opts);

  // We need special handling in case the user's version of nc doesn't support
  // using unix sockets.
  if (stderr.includes("invalid option -- U")) {
    throw new Error(`
      @prettier/plugin-ruby uses netcat to communicate over unix sockets between
      the node.js process running prettier and an underlying Ruby process used
      for parsing. Unfortunately the version of netcat that you have installed
      (GNU netcat) does not support unix sockets. To solve this either uninstall
      GNU netcat and use a different implementation, or change the value of the
      rubyNetcatCommand option in your prettier configuration.
    `);
  }

  // If we didn't receive anything over stdout or we have a bad exit status,
  // then throw whatever we can.
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
