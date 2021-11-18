# frozen_string_literal: true

require 'test_helper'

class ParserTest < Minitest::Test
  def test_events
    filepath = File.expand_path('../../src/ruby/parser.rb', __dir__)
    pattern = /(?:alias|def) on_([^(\s]+)/

    # This is a list of all of the parser events that Ripper will emit
    all_events = Ripper::EVENTS

    # This is a list of all of the parser events for which we have an explicitly
    # defined event handler in our parser.
    handled_events =
      File.read(filepath).scan(pattern).map { |event,| event.to_sym }

    # Assert here that there are no missing events.
    assert_empty(all_events - handled_events)
  end
end
