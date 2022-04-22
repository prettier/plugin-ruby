const long = Array(80).fill("a").join("");

function stripLeadingWhitespace(code) {
  if (!code.includes("\n")) {
    return code;
  }

  const lines = code.split("\n");

  const indent = lines[1].split("").findIndex((char) => /[^\s]/.test(char));
  const content = lines.slice(1, lines.length - 1);

  return content.map((line) => line.slice(indent)).join("\n");
}

function ruby(code) {
  return stripLeadingWhitespace(code);
}

function rbs(code) {
  return { code: stripLeadingWhitespace(code), parser: "rbs" };
}

function haml(code) {
  return { code: stripLeadingWhitespace(code), parser: "haml" };
}

// The follow are two functions used for comparing against the provided
// RUBY_VERSION environment variable. That variable is set in globalSetup so it
// should be always available. TypeScript doesn't know that though, so we
// explicitly allow it to be undefined by coalescing with the empty string.

function atLeastVersion(version) {
  return (process.env.RUBY_VERSION || "") >= version;
}

function atMostVersion(version) {
  return (process.env.RUBY_VERSION || "") < version;
}

module.exports = {
  long,
  ruby,
  rbs,
  haml,
  atLeastVersion,
  atMostVersion
};
