function getTrailingComma(opts) {
  return ["all", "es5"].includes(opts.trailingComma);
}

module.exports = getTrailingComma;
