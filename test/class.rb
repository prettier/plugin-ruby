module Prettier
  class Vehicle
    attr_accessor :wheels

    def initialize(wheels)
      self.wheels = wheels
    end

    def drive
      @wheels
    end
  end

  class Car < Vehicle
    WHEELS = 4

    def initialize
      super(WHEELS)
    end

    def drive
      super
    end
  end
end

::Prettier::Vehicle.new(3)

def Vehicle.drive
  'vroom'
end
