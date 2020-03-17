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
      Dir['{{exe,lib,src}/**/*,*.md}'] +
        %w[
          bin/console
          LICENSE
          node_modules/prettier/bin-prettier.js
          node_modules/prettier/index.js
          node_modules/prettier/third-party.js
          package.json
        ]
    end

  spec.bindir = 'exe'
  spec.executables = 'rbprettier'
  spec.require_paths = %w[lib]

  spec.add_development_dependency 'bundler'
  spec.add_development_dependency 'minitest', '~> 5.13'
  spec.add_development_dependency 'rake', '~> 13.0'
end
