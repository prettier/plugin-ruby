# frozen_string_literal: true

$LOAD_PATH.unshift(File.expand_path('../../lib', __dir__))

require 'prettier'
require_relative '../../src/ruby/parser'
require_relative '../../src/rbs/parser'

require 'minitest/autorun'
