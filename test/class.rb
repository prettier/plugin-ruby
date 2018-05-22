require 'date'

module Prettier
  class User
    attr_reader :first_name, :last_name, :birthdate
    alias full_name name

    def initialize(first_name, last_name, birthdate = nil)
      @first_name = first_name
      @last_name = last_name
      @birthdate = birthdate
    end

    def full_name
      "#{first_name} #{last_name}"
    end

    def age
      unless birthday
        return nil
      end

      ((Date.today - birthdate) / 365).to_i
    end
  end

  class Employee < User
    def age
      super
    end

    def names
      first_name, last_name = full_name.split(' ')
      [first_name, last_name]
    end
  end
end
