lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'prettier/version'

Gem::Specification.new do |spec|
  package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
  spec.name = 'prettier'
  spec.version = Prettier::VERSION
  spec.authors = [package['author']]

  spec.summary = package['description']
  spec.description = package['description']
  spec.homepage = package['homepage']
  spec.license = package['license']

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['homepage_uri'] = spec.homepage
    spec.metadata['source_code_uri'] = spec.homepage
    spec.metadata['changelog_uri'] = "#{spec.homepage}/blob/master/CHANGELOG.md"
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
            'public gem pushes.'
  end

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files =
    Dir.chdir(File.expand_path('..', __FILE__)) do
      `git ls-files -z`.split('\x0').select do |f|
        f.match(
          /^(bin|exe|src|CHANGELOG.md|package.json|yarn.lock|.rubocop.yml)/
        )
      end
    end

  spec.bindir = 'exe'
  spec.executables = 'ruby-prettier'
  spec.require_paths = %w[lib]

  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 12.3'
  spec.add_dependency 'thor', '~> 0.20'
end
