# frozen_string_literal: true

require "json" unless defined?(JSON)
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Gem::Specification.new do |spec|
  spec.name = "prettier"
  spec.version = package.fetch("version")
  spec.authors = [package.fetch("author")]

  spec.summary = package.fetch("description")
  spec.homepage = package.fetch("homepage")
  spec.license = package.fetch("license")

  spec.files =
    Dir.chdir(__dir__) do
      %w[LICENSE package.json rubocop.yml] + Dir["{{exe,lib,src}/**/*,*.md}"] +
        Dir["node_modules/prettier/**/*"]
    end

  spec.required_ruby_version = ">= 2.7.0"

  spec.bindir = "exe"
  spec.executables = "rbprettier"
  spec.require_paths = %w[lib]

  spec.add_dependency "syntax_tree", ">= 4.0.1"
  spec.add_dependency "syntax_tree-haml", ">= 2.0.0"
  spec.add_dependency "syntax_tree-rbs", ">= 0.2.0"

  spec.add_development_dependency "bundler"
  spec.add_development_dependency "minitest"
  spec.add_development_dependency "rake"
end
