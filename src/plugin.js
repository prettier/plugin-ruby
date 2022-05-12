const { parseSync } = require("./parseSync");

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
    ruby: {
      parse(text, _parsers, opts) {
        return parseSync("ruby", text, opts);
      },
      astFormat: "ruby",
      hasPragma(text) {
        return /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/m.test(text);
      },
      locStart() {
        return 0;
      },
      locEnd() {
        return 0;
      }
    },
    rbs: {
      parse(text, _parsers, opts) {
        return parseSync("rbs", text, opts);
      },
      astFormat: "rbs",
      hasPragma(text) {
        return /^\s*#[^\S\n]*@(prettier|format)\s*(\n|$)/.test(text);
      },
      locStart() {
        return 0;
      },
      locEnd() {
        return 0;
      }
    },
    haml: {
      parse(text, _parsers, opts) {
        return parseSync("haml", text, opts);
      },
      astFormat: "haml",
      hasPragma(text) {
        return /^\s*-#\s*@(prettier|format)/.test(text);
      },
      locStart() {
        return 0;
      },
      locEnd() {
        return 0;
      }
    }
  },
  printers: {
    ruby: {
      print(path) {
        return path.getValue();
      },
      insertPragma(text) {
        return `# @format${text.startsWith("#") ? "\n" : "\n\n"}${text}`;
      }
    },
    rbs: {
      print(path) {
        return path.getValue();
      },
      insertPragma(text) {
        return `# @format${text.startsWith("#") ? "\n" : "\n\n"}${text}`;
      }
    },
    haml: {
      print(path) {
        return path.getValue();
      },
      insertPragma(text) {
        return `-# @format${text.startsWith("-#") ? "\n" : "\n\n"}${text}`;
      }
    }
  },
  options: {
    rubyPlugins: {
      type: "string",
      category: "Ruby",
      default: "",
      description: "The comma-separated list of plugins to require",
      since: "3.1.0"
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

module.exports = plugin;
