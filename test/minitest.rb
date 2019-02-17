require 'bundler/setup'
require 'minitest/autorun'

$LOAD_PATH.unshift(ARGV[0])
require ARGV[1]
