require 'json'

module Prettier
  VERSION =
    JSON.parse(File.read(File.join(__dir__, '..', '..', 'package.json')))[
      'version'
    ]
end
