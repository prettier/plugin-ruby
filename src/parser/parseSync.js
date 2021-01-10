const requestParse = require("./requestParse");

// Formats and sends a request to the parser server. We use netcat (or something
// like it) here since Prettier requires the results of `parse` to be
// synchronous and Node.js does not offer a mechanism for synchronous socket
// requests.
function parseSync(parser, source) {
  const response = requestParse(parser, source);

  if (
    response.stdout.length === 0 ||
    (response.status !== null && response.status !== 0)
  ) {
    console.error("Could not parse response from server");
    console.error(response);

    throw new Error(response.stderr || "An unknown error occurred");
  }

  const parsed = JSON.parse(response.stdout);

  if (parsed.error) {
    throw new Error(
      `@prettier/plugin-ruby encountered an error when attempting to parse \
the ruby source. This usually means there was a syntax error in the \
file in question. You can verify by running \`ruby -i [path/to/file]\`.`
    );
  }

  return parsed;
}

module.exports = parseSync;
