import { Plugin } from "../ruby/nodes/types";

const literallineWithoutBreakParent = {
  type: "line",
  hard: true,
  literal: true
} as Plugin.Doc;

export default literallineWithoutBreakParent;
