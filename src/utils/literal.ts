import { Plugin } from "../types";

function literal(value: string): Plugin.Printer<Record<string, unknown>> {
  return function printLiteral() {
    return value;
  };
}

export default literal;
