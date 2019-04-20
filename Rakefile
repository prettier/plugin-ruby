# frozen_string_literal: true

require 'bundler/gem_tasks'
require 'rake/testtask'

Rake::TestTask.new(:test) do |t|
  t.libs << 'test/rb'
  t.libs << 'lib'
  t.test_files = FileList['test/rb/**/*_test.rb']
end

desc 'Build executable files for Prettier'
task :pkg do
  sh 'yarn && yarn build'
end

task build: :pkg

task default: :test
