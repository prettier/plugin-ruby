import type * as Prettier from "prettier";

type Doc = Prettier.doc.builders.Doc;
type Builders = Omit<typeof Prettier.doc.builders, "join"> & {
  // Explicitly overwriting the type of the join builder because I don't want to
  // have to go around saying "as Doc[]" everywhere.
  join: (sep: Doc, docs: Doc | Doc[]) => Prettier.doc.builders.Concat;
};

// If `RBPRETTIER` is set, then this is being run from the `Prettier::run` ruby
// method. In that case, we need to pull `prettier` from the node_modules
// directly, as it's been shipped with the gem.
/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const source: typeof Prettier = require(process.env.RBPRETTIER
  ? "../node_modules/prettier"
  : "prettier");

// Cramming everything together to make it simpler to pull in all of the right
// utilities and builders.
const builders = source.doc.builders as Builders;
const exported = { ...builders, ...source.doc.utils, ...source.util };

export default exported;
