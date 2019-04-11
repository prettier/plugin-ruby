# frozen_string_literal: true

# rubocop:disable Lint/UnneededCopDisableDirective
# rubocop:disable Style/SymbolLiteral

def foo
  {
    'test': 1,
    'special-key': 2,
    "double-quote": 3,
    "#{1 + 1}": 4,
    :"non-hash-label" => 5
  }
end

# rubocop:enable Style/SymbolLiteral
# rubocop:enable Lint/UnneededCopDisableDirective
