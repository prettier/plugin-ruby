require 'date'

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
    birthday && ((Date.today - birthdate) / 365).to_i
  end
end
