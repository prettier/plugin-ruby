// If `RBPRETTIER` is set, then this is being run from the `Prettier::run` ruby
// method. In that case, we need to pull `prettier` from the node_modules
// directly, as it's been shipped with the gem.
const source = process.env.RBPRETTIER ? "../node_modules/prettier" : "prettier";
const { builders, utils } = require(source).doc;

module.exports = Object.assign({}, builders, utils);
