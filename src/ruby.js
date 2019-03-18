const parse = require("./parse");
const print = require("./print");

const pragmaPattern = /#\s*@(prettier|format)/;
const hasPragma = text => pragmaPattern.test(text);

module.exports = {
  languages: [{
    name: "Ruby",
    parsers: ["ruby"],
    extensions: [
      ".gemspec",
      ".podspec",
      ".rake",
      ".rb",
      ".ru"
    ],
    filenames: [
      ".irbrc",
      ".pryrc",
      "Capfile",
      "Gemfile",
      "Guardfile",
      "Podfile",
      "Rakefile"
    ],
    linguistLanguageId: 326,
    vscodeLanguageIds: ["ruby"]
  }],
  parsers: {
    ruby: {
      parse,
      astFormat: "ruby",
      hasPragma
    }
  },
  printers: {
    ruby: {
      print
    }
  },
  options: {
    addTrailingCommas: {
      type: "boolean",
      category: "Global",
      default: false,
      description: "Adds a trailing comma to array literals, hash literals, and method calls."
    },
    inlineConditionals: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allows if and unless statements to use the modifier form."
    },
    inlineLoops: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allows while and until statements to use the modifier form."
    },
    preferHashLabels: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When possible, uses the shortened hash key syntax, as opposed to hash rockets."
    },
    preferSingleQuotes: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
