const { spawnSync } = require("child_process");

const nodes = require("../../../src/ruby/nodes");
const print = require("../../../src/ruby/printer").print;

const expectedUnhandledNodes = [
  "alias_error",
  "arg_ambiguous",
  "args_add",
  "args_new",
  "assign_error",
  "class_name_error",
  "excessed_comma",
  "heredoc_dedent",
  "magic_comment",
  "mlhs_add",
  "mlhs_new",
  "mrhs_add",
  "mrhs_new",
  "nokw_param",
  "operator_ambiguous",
  "param_error",
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
  "symbol",
  "symbols_add",
  "symbols_new",
  "void_stmt",
  "word_add",
  "word_new",
  "words_add",
  "words_new",
  "xstring_add",
  "xstring_new"
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

  return child.stdout.toString().trim().split("\n");
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
