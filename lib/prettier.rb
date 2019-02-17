# frozen_string_literal: true

require 'thor'

module Prettier
  class CLI < Thor
    default_task :format

    def self.exit_on_failure?
      true
    end

    map %w[--version -v] => :version
    desc '--version, -v', 'Print the ruby-prettier version'
    def version
      say "#{Prettier::VERSION}"
    end

    desc '[file/glob ...]', 'Run ruby prettier on the given files'
    def format(*arguments)
      if arguments.empty?
        system("#{prettier} --help")
        return
      end

      command = "#{prettier} --plugin '#{File.join(__dir__, '..')}' "
      command += "#{arguments.map { |argument| "'#{argument}'" }.join(' ')} "

      system(command)
      exit($?.exitstatus) if $?.exited?
    end

    private

    def prettier
      target =
        if RUBY_PLATFORM =~ /darwin/
          'prettier-macos'
        elsif RUBY_PLATFORM =~ /linux/
          'prettier-linux'
        elsif RUBY_PLATFORM =~ /win32/
          'prettier-win.exe'
        else
          raise "Unsupported platform #{RUBY_PLATFORM}"
        end
      File.join(__dir__, '..', 'pkg', target)
    end
  end
end
