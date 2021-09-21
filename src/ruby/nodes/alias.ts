import type { Plugin, Ruby } from "../../types";
import prettier from "../../prettier";

const { addTrailingComment, align, group, hardline, line } = prettier;

// The `alias` keyword is used to make a method respond to another name as well
// as the current one. For example, to get the method `foo` to also respond to
// `bar`, you would:
//
//     alias bar foo
//
// Now, in the current context you can call `bar` and it will execute the `foo`
// method.
//
// When you're aliasing two methods, you can either provide bare words (like the
// example above) or you can provide symbols (note that this includes dynamic
// symbols like :"foo-#{bar}-baz"). In general, to be consistent with the ruby
// style guide, we prefer bare words:
//
//     https://github.com/rubocop-hq/ruby-style-guide#alias-method-lexically
//
// The `alias` node contains two children. The left and right align with the
// arguments passed to the keyword. So, for the above example the left would be
// the symbol literal `bar` and the right could be the symbol literal `foo`.
export const printAlias: Plugin.Printer<Ruby.Alias | Ruby.VarAlias> = (
  path,
  opts,
  print
) => {
  const keyword = "alias ";

  // In general, return the printed doc of the argument at the provided index.
  // Special handling is given for symbol literals that are not bare words, as
  // we convert those into bare words by just pulling out the ident node.
  const printAliasArg = (
    argPath: Plugin.Path<
      Ruby.Backref | Ruby.DynaSymbol | Ruby.GVar | Ruby.SymbolLiteral
    >
  ) => {
    const argNode = argPath.getValue();

    if (argNode.type === "symbol_literal") {
      // If we're going to descend into the symbol literal to grab out the ident
      // node, then we need to make sure we copy over any comments as well,
      // otherwise we could accidentally skip printing them.
      if (argNode.comments) {
        argNode.comments.forEach((comment) => {
          addTrailingComment(argNode.body[0], comment);
        });
      }

      return argPath.call(print, "body", 0);
    }

    return print(argPath);
  };

  return group([
    keyword,
    path.call(printAliasArg, "body", 0),
    group(
      align(keyword.length, [
        // If the left child has any comments, then we need to explicitly break
        // this into two lines
        path.getValue().body[0].comments ? hardline : line,
        path.call(printAliasArg, "body", 1)
      ])
    )
  ]);
};
