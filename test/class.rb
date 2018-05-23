module Prettier
  class Vehicle
    attr_accessor :wheels

    def initialize(wheels)
      @wheels = wheels
    end

    def drive
    end
  end

  class Car < Vehicle
    def initialize
      super(4)
    end

    def drive
      super
    end
  end
end

Prettier::Vehicle.new(3)
