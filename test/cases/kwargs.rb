# frozen_string_literal: true

def add(alpha:, beta:, gamma: 1, delta: 2)
  alpha + beta + gamma + delta
end

add(alpha: 1, beta: 2, gamma: 3, delta: 4)

args = { alpha: 1, beta: 2, gamma: 3 }
add(**args, delta: 4)
