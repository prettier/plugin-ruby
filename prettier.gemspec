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
    Dir.chdir(File.expand_path('..', __FILE__)) do
      `git ls-files -z`.split("\x0").select do |f|
        f.match(
          /^(bin|exe|src|CHANGELOG.md|package.json|yarn.lock|.rubocop.yml)/
        )
      end
    end

  spec.bindir = 'exe'
  spec.executables = 'rbprettier'
  spec.require_paths = %w[lib]

  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 12.3'
end
