// If `RBPRETTIER` is set, then this is being run from the `Prettier::run` ruby
// method. In that case, we need to pull `prettier` from the node_modules
// directly, as it's been shipped with the gem.
const source = process.env.RBPRETTIER ? "../node_modules/prettier" : "prettier";

const prettier = require(source);

// Just combine all the things into one big object so that we can import
// whatever we need from prettier without having to dive too deeply.
module.exports = Object.assign(
  {},
  prettier.doc.builders,
  prettier.doc.utils,
  prettier.util
);
