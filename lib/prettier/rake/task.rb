# frozen_string_literal: true

require "rake"
require "rake/tasklib"

module Prettier
  module Rake
    # A Rake task that runs prettier on a set of source files.
    #
    # Example:
    #
    #   require 'prettier/rake/task'
    #
    #   Prettier::Rake::Task.new do |t|
    #     t.source_files = '{app,config,lib}/**/*.rb'
    #   end
    #
    # This will create a task that can be run with:
    #
    #   rake prettier
    #
    class Task < ::Rake::TaskLib
      # Name of prettier task.
      # Defaults to :prettier.
      attr_accessor :name

      # Whether or not to overwrite the source files with the prettier output.
      # Defaults to true.
      attr_accessor :write

      # Glob pattern to match source files.
      # Defaults to 'lib/**/*.rb'.
      attr_accessor :source_files

      def initialize(name = :prettier)
        @name = name
        @write = true
        @source_files = "lib/**/*.rb"

        yield self if block_given?
        define_task
      end

      private

      def define_task
        desc "Runs prettier over source files"
        task(name) { run_task }
      end

      def run_task
        Prettier.run([write ? "--write" : "--check", source_files].compact)
        exit($?.exitstatus) if $?&.exited?
      end
    end
  end
end
