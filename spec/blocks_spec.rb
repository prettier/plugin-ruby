# frozen_string_literal: true

require 'minitest/autorun'
require 'open3'

# rubocop:disable Metrics/BlockLength

describe 'Blocks' do
  describe 'an empty block' do
    it 'renders with one space' do
      assert_equal_and_valid(
        'loop {}',
        'loop { }'
      )
    end
  end

  describe 'a block with a paramer and a body' do
    it 'inserts a space arount the content and paramter' do
      assert_equal_and_valid(
        'loop {|el|el + 1}',
        'loop { |el| el + 1 }'
      )
    end
  end

  def assert_equal_and_valid(input, expected)
    result = apply_prettier(input)
    assert_equal expected, result
    ensure_valid(expected)
  end

  def ensure_valid(string)
    _, stderr_str, status = Open3.capture3('ruby -c', stdin_data: string)
    assert_equal status.success?, true, stderr_str
  end

  def apply_prettier(string)
    file = write_string_to_tempfile(string)
    run_prettier_on_file(file.path)
  end

  def write_string_to_tempfile(string)
    Tempfile.new('prettier-ruby-test.rb').tap do |file|
      file.write(string)
      file.close
    end
  end

  def run_prettier_on_file(path)
    `bin/print #{path}`.rstrip
  end
end

# rubocop:enable Metrics/BlockLength
