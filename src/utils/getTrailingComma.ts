import type { Plugin } from "../ruby/nodes/types";

function getTrailingComma(opts: Plugin.Options) {
  return ["all", "es5"].includes(opts.trailingComma);
}

export default getTrailingComma;
