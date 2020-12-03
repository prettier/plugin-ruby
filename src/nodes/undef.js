const { align, concat, group, join, line } = require("../prettier");

const printUndef = (path, opts, print) => {
  const keyword = "undef ";

  return group(
    concat([
      keyword,
      align(
        keyword.length,
        join(concat([",", line]), path.map(print, "body", 0))
      )
    ])
  );
};

module.exports = {
  undef: printUndef
};
