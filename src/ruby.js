const printer = require("./printer");
const parser = require("./parser");

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
    }
  ],
  parsers: {
    ruby: parser
  },
  printers: {
    ruby: printer
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
