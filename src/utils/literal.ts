import { Plugin } from "../ruby/types";

function literal(value: string): Plugin.Printer<{}> {
  return function printLiteral() {
    return value;
  };
}

export default literal;
