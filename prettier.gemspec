# frozen_string_literal: true

require 'json' unless defined?(JSON)
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Gem::Specification.new do |spec|
  spec.name = 'prettier'
  spec.version = package['version']
  spec.authors = [package['author']]

  spec.summary = package['description']
  spec.homepage = package['homepage']
  spec.license = package['license']

  spec.files =
    Dir.chdir(__dir__) do
      %w[LICENSE bin/console package.json rubocop.yml] +
        Dir['{{exe,lib,dist}/**/*,*.md}'] +
        Dir[
          'node_modules/prettier/{package.json,index.js,doc.js,bin-prettier.js,third-party.js,parser-*.js}'
        ]
    end

  spec.bindir = 'exe'
  spec.executables = 'rbprettier'
  spec.require_paths = %w[lib]
end
