# frozen_string_literal: true

require 'test_helper'

class ParserTest < Minitest::Test
  def test_events
    # This is a list of all of the parser events that Ripper will emit
    all_events = Ripper::PARSER_EVENTS

    # This is a list of all of the parser events for which we have an explicitly
    # defined event handler in our parser.
    handled_events =
      Prettier::Parser.private_instance_methods.grep(/\Aon_(.+)/) { $1.to_sym }

    # Assert here that there are no missing events.
    assert_empty(all_events - handled_events)
  end
end
