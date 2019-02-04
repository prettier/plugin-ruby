# frozen_string_literal: true

def foo
  return if a
end

def bar
  return 1 if a
end

def baz
  return(1) if a
end

def qux
  return 1, 2 if a
end
