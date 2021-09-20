import { Plugin } from "../types";

function literal(value: string): Plugin.Printer<{}> {
  return function printLiteral() {
    return value;
  };
}

export default literal;
