module Prettier
  class User
    attr_reader :first_name, :last_name
    alias full_name name

    def initialize(first_name, last_name)
      @first_name = first_name
      @last_name = last_name
      @birthdate = birthdate
    end

    def full_name
      "#{first_name} #{last_name}"
    end

    class << self
      def build
        [
          new('Clark', 'Kent'),
          new('Bruce', 'Wayne'),
          new('Diana', 'Prince')
        ]
      end
    end
  end
end

puts Prettier::User.build[0...2]
