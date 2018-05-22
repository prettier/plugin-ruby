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
  end
end

users = [
  Prettier::User.new('Clark', 'Kent'),
  Prettier::User.new('Bruce', 'Wayne'),
  Prettier::User.new('Diana', 'Prince')
]

puts users.map(&:name)
