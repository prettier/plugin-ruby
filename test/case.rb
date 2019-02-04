# frozen_string_literal: true

# rubocop:disable Lint/EmptyWhen
# Disabling EmptyWhen on account of
# https://github.com/rubocop-hq/rubocop/issues/3696.

# rubocop:disable Style/EmptyCaseCondition
# This is something that we should handle by converting each of the when
# statements into valid if/elsif/else statements.

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
