const { spawnSync } = require("child_process");

const nodes = require("../../src/nodes");
const print = require("../../src/print");

const expectedUnhandledNodes = [
  "arg_ambiguous",
  "args_add",
  "args_new",
  "heredoc_dedent",
  "magic_comment",
  "mlhs_add",
  "mlhs_new",
  "mrhs_add",
  "mrhs_new",
  "operator_ambiguous",
  "parse_error",
  "qsymbols_add",
  "qsymbols_new",
  "qwords_add",
  "qwords_new",
  "regexp_add",
  "regexp_new",
  "stmts_add",
  "stmts_new",
  "string_add",
  "string_content",
  "symbols_add",
  "symbols_new",
  "void_stmt",
  "words_add",
  "words_new",
  "xstring_add",
  "xstring_new",
  ""
];

const possibleNodes = () => {
  const child = spawnSync("ruby", [
    "--disable-gems",
    "-rripper",
    "-e",
    "puts Ripper::PARSER_EVENTS"
  ]);

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  return child.stdout.toString().split("\n");
};

describe("node support", () => {
  test("handles all ripper parsing events", () => {
    const supportedNodes = Object.keys(nodes)
      .concat(expectedUnhandledNodes)
      .sort();
    expect(supportedNodes).toEqual(
      expect.arrayContaining(possibleNodes().sort())
    );
  });

  test("when encountering an unsupported node type", () => {
    const path = { getValue: () => ({ type: "unsupported", body: {} }) };

    expect(() => print(path)).toThrow("Unsupported");
  });
});
