# frozen_string_literal: true

# rubocop:disable Lint/EmptyWhen, Style/EmptyCaseCondition

case
when a
  1
end

case a
when b
  1
end

case a
when b, c
  1
end

case a
when b
when c
  1
end

case a
when b
  1
when c
  2
end

case a
when b
  1
else
  2
end

# rubocop:enable Lint/EmptyWhen, Style/EmptyCaseCondition
