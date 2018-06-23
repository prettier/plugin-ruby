require 'json'
require_relative './ripper_js.rb'

result = RipperJS.sexp(*ARGV)
puts JSON.generate(result, max_nesting: false)
