function literal(value) {
  return function printLiteral() {
    return value;
  };
}

module.exports = literal;
