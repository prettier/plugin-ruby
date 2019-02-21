# frozen_string_literal: true

module Pret
  module Tier
    # object documentation
    class Object; end

    # second object
    # documentation
    class Object
    end

    # third object
    # documentation
    class Object
      attr_accessor :foo
    end

    class Object < BasicObject; end

    class Object < BasicObject
    end

    class Object < BasicObject
      # inside class documentation
      attr_accessor :bar
    end

    class SuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLongClassName; end

    module SuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLongModName; end

    class << self
      # method documentation
      def method; end

      undef method
    end

    module Prettier; end

    module Prettier
    end

    module Prettier
      # inside module documentation
      attr_accessor :foo
    end
  end
end

Pret::Tier::Object # rubocop:disable Lint/Void
Pret::TIER = 'config'.to_s

::Pret::Tier::Object # rubocop:disable Lint/Void
::PRET = 'config'.to_s
