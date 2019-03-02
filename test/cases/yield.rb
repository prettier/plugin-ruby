# frozen_string_literal: true

[1, 2, 3].each do |i|
  yield

  yield i

  yield(i)

  yield i, 2

  yield(i, 2)

  yield
end
