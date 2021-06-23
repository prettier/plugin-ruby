const rubyPrinter = require("./ruby/printer");
const rubyParser = require("./ruby/parser");

const rbsPrinter = require("./rbs/printer");
const rbsParser = require("./rbs/parser");

const hamlPrinter = require("./haml/printer");
const hamlParser = require("./haml/parser");

/*
 * metadata mostly pulled from linguist and rubocop:
 * https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
 * https://github.com/rubocop/rubocop/blob/master/spec/rubocop/target_finder_spec.rb
 */

module.exports = {
  languages: [
    {
      name: "Ruby",
      parsers: ["ruby"],
      extensions: [
        ".arb",
        ".axlsx",
        ".builder",
        ".eye",
        ".fcgi",
        ".gemfile",
        ".gemspec",
        ".god",
        ".jb",
        ".jbuilder",
        ".mspec",
        ".opal",
        ".pluginspec",
        ".podspec",
        ".rabl",
        ".rake",
        ".rb",
        ".rbi",
        ".rbuild",
        ".rbw",
        ".rbx",
        ".ru",
        ".ruby",
        ".thor",
        ".watchr"
      ],
      filenames: [
        ".irbrc",
        ".pryrc",
        ".simplecov",
        "Appraisals",
        "Berksfile",
        "Brewfile",
        "Buildfile",
        "Capfile",
        "Cheffile",
        "Dangerfile",
        "Deliverfile",
        "Fastfile",
        "Gemfile",
        "Guardfile",
        "Jarfile",
        "Mavenfile",
        "Podfile",
        "Puppetfile",
        "Rakefile",
        "Snapfile",
        "Thorfile",
        "Vagabondfile",
        "Vagrantfile",
        "buildfile"
      ],
      interpreters: ["jruby", "macruby", "rake", "rbx", "ruby"],
      linguistLanguageId: 326,
      vscodeLanguageIds: ["ruby"]
    },
    {
      name: "RBS",
      parsers: ["rbs"],
      extensions: [".rbs"]
    },
    {
      name: "HAML",
      parsers: ["haml"],
      extensions: [".haml"],
      vscodeLanguageIds: ["haml"]
    }
  ],
  parsers: {
    ruby: rubyParser,
    rbs: rbsParser,
    haml: hamlParser
  },
  printers: {
    ruby: rubyPrinter,
    rbs: rbsPrinter,
    haml: hamlPrinter
  },
  options: {
    rubyArrayLiteral: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When possible, favor the use of string and symbol array literals."
    },
    rubyHashLabel: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When possible, uses the shortened hash key syntax, as opposed to hash rockets."
    },
    rubyModifier: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When it fits on one line, allows if, unless, while, and until statements to use the modifier form."
    },
    rubyNetcatCommand: {
      type: "string",
      category: "Ruby",
      description:
        'The prefix of the command to execute to communicate between the node.js process and the Ruby process. (For example, "nc -U" or "telnet -u") Normally you should not set this option.'
    },
    rubySingleQuote: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals."
    },
    rubyToProc: {
      type: "boolean",
      category: "Ruby",
      default: false,
      description:
        "When possible, convert blocks to the more concise Symbol#to_proc syntax."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: "none"
  }
};
