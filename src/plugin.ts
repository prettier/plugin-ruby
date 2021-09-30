import rubyPrinter from "./ruby/printer";
import rubyParser from "./ruby/parser";

import rbsPrinter from "./rbs/printer";
import rbsParser from "./rbs/parser";

import hamlPrinter from "./haml/printer";
import hamlParser from "./haml/parser";

/*
 * metadata mostly pulled from linguist and rubocop:
 * https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
 * https://github.com/rubocop/rubocop/blob/master/spec/rubocop/target_finder_spec.rb
 */
const plugin = {
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
        "When possible, favor the use of string and symbol array literals.",
      since: "1.0.0"
    },
    rubyHashLabel: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When possible, uses the shortened hash key syntax, as opposed to hash rockets.",
      since: "1.0.0"
    },
    rubyModifier: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When it fits on one line, allows if, unless, while, and until statements to use the modifier form.",
      since: "1.0.0"
    },
    rubySingleQuote: {
      type: "boolean",
      category: "Ruby",
      default: true,
      description:
        "When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals.",
      since: "1.0.0"
    },
    rubyToProc: {
      type: "boolean",
      category: "Ruby",
      default: false,
      description:
        "When possible, convert blocks to the more concise Symbol#to_proc syntax.",
      since: "1.0.0"
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: "none"
  }
};

export = plugin;
