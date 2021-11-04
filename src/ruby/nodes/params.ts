import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { group, hardline, join, indent, line, lineSuffix, softline } = prettier;

type RestParam = Ruby.KeywordRestParam | Ruby.RestParam;

function printRestParamSymbol(symbol: string): Plugin.Printer<RestParam> {
  return function printRestParamWithSymbol(path, opts, print) {
    const node = path.getValue();

    return node.name ? [symbol, path.call(print, "name")] : symbol;
  };
}

export const printParams: Plugin.Printer<Ruby.Params> = (path, opts, print) => {
  const node = path.getValue();
  let parts: Plugin.Doc[] = [];

  if (node.reqs) {
    path.each((reqPath) => {
      // For some very strange reason, if you have a comment attached to a
      // rest_param, it shows up here in the list of required params.
      if ((reqPath.getValue().type as any) !== "rest_param") {
        parts.push(print(reqPath));
      }
    }, "reqs");
  }

  if (node.opts) {
    parts = parts.concat(
      path.map((optlPath) => join(" = ", optlPath.map(print)), "opts")
    );
  }

  if (node.rest && node.rest.type !== "excessed_comma") {
    parts.push(path.call(print, "rest"));
  }

  if (node.posts) {
    parts = parts.concat(path.map(print, "posts"));
  }

  if (node.keywords) {
    parts = parts.concat(
      path.map((kwargPath) => {
        const kwarg = kwargPath.getValue();
        const keyDoc = kwargPath.call(print, 0);

        if (kwarg[1]) {
          return group([keyDoc, " ", kwargPath.call(print, 1)]);
        }

        return keyDoc;
      }, "keywords")
    );
  }

  if (node.kwrest) {
    parts.push(node.kwrest === "nil" ? "**nil" : path.call(print, "kwrest"));
  }

  if (node.block) {
    parts.push(path.call(print, "block"));
  }

  const contents: Plugin.Doc[] = [join([",", line], parts)];

  // You can put an extra comma at the end of block args between pipes to
  // change what it does. Below is the difference:
  //
  // [[1, 2], [3, 4]].each { |x| p x } # prints [1, 2] then [3, 4]
  // [[1, 2], [3, 4]].each { |x,| p x } # prints 1 then 3
  //
  // In ruby 2.5, the excessed comma is indicated by having a 0 in the rest
  // param position. In ruby 2.6+ it's indicated by having an "excessed_comma"
  // node in the rest position. Seems odd, but it's true.
  if (
    (node.rest as any) === 0 ||
    (node.rest && node.rest.type === "excessed_comma")
  ) {
    contents.push(",");
  }

  // If the parent node is a paren then we skipped printing the parentheses so
  // that we could handle them here and get nicer formatting.
  const parentNode = path.getParentNode();

  if (["lambda", "paren"].includes(parentNode.type)) {
    const parts: Plugin.Doc[] = ["("];

    // If the parent node is a paren and the paren has comments that are
    // attached to the left paren, then we need to print those out explicitly
    // here.
    if (parentNode.type === "paren" && parentNode.lparen.comments) {
      const comments: Plugin.Doc[] = [];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (parentNode as Ruby.Paren).lparen.comments!.forEach((comment, index) => {
        comment.printed = true;
        comments.push(lineSuffix(`${index === 0 ? " " : ""}#${comment.value}`));
      });

      parts.push(join(hardline, comments));
    }

    return group([...parts, indent([softline, ...contents]), softline, ")"]);
  }

  return group(contents);
};

export const printArgsForward: Plugin.Printer<Ruby.ArgsForward> = (path) =>
  path.getValue().value;
export const printKeywordRestParam = printRestParamSymbol("**");
export const printRestParam = printRestParamSymbol("*");

export const printExcessedComma: Plugin.Printer<Ruby.ExcessedComma> = (
  path,
  opts,
  print
) => {
  return path.call(print, "value");
};
