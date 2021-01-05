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

module.exports = { long, ruby, rbs, haml };
