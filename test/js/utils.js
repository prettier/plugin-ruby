const long = Array(80).fill("a").join("");

const ruby = (code) => {
  const lines = code.split("\n");

  const indent = lines[1].split("").findIndex((char) => /[^\s]/.test(char));
  const content = lines.slice(1, lines.length - 1);

  return content.map((line) => line.slice(indent)).join("\n");
};

module.exports = { long, ruby };
