module.exports = {
  "@int": (path, _opts, _print) => {
    const { body } = path.getValue();

    // If the number is octal and does not contain the optional "o" character
    // after the leading 0, add it in.
    if (/^0[0-9]/.test(body)) {
      return `0o${body.slice(1)}`;
    }

    // If the number is a base 10 number, is sufficiently large, and is not
    // already formatted with underscores, then add them in in between the
    // numbers every three characters starting from the right.
    if (!body.startsWith("0") && body.length >= 5 && !body.includes("_")) {
      return `  ${body}`
        .slice((body.length + 2) % 3)
        .match(/.{3}/g)
        .join("_")
        .trim();
    }

    return body;
  }
};
