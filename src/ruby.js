const parse = require("./parse");
const print = require("./print");

const haml = require("./haml");

const pragmaPattern = /#\s*@(prettier|format)/;
const hasPragma = (text) => pragmaPattern.test(text);

const locStart = (node) => node.char_start;
const locEnd = (node) => node.char_end;

/*
 * metadata mostly pulled from linguist and rubocop:
 * https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
 * https://github.com/rubocop-hq/rubocop/blob/master/spec/rubocop/target_finder_spec.rb
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
      name: "HAML",
      parsers: ["haml"],
      extensions: [".haml"],
      vscodeLanguageIds: ["haml"]
    }
  ],
  parsers: {
    ruby: {
      parse,
      astFormat: "ruby",
      hasPragma,
      locStart,
      locEnd
    },
    haml: {
      parse: haml.parse,
      astFormat: "haml",
      hasPragma: haml.hasPragma,
      locStart: haml.locStart,
      locEnd: haml.locEnd
    }
  },
  printers: {
    ruby: {
      print
    },
    haml: {
      embed: haml.embed,
      print: haml.print
    }
  },
  options: {
    addTrailingCommas: {
      type: "boolean",
      category: "Global",
      default: false,
      description:
        "Adds a trailing comma to array literals, hash literals, and method calls."
    },
    inlineConditionals: {
      type: "boolean",
      category: "Global",
      default: true,
      description:
        "When it fits on one line, allows if and unless statements to use the modifier form."
    },
    inlineLoops: {
      type: "boolean",
      category: "Global",
      default: true,
      description:
        "When it fits on one line, allows while and until statements to use the modifier form."
    },
    preferHashLabels: {
      type: "boolean",
      category: "Global",
      default: true,
      description:
        "When possible, uses the shortened hash key syntax, as opposed to hash rockets."
    },
    preferSingleQuotes: {
      type: "boolean",
      category: "Global",
      default: true,
      description:
        "When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
