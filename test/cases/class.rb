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
      def method1; end

      def method2; end

      def method3; end

      def method_with_a_long_name1; end

      def method_with_a_long_name2; end

      def method_with_a_long_name3; end

      undef method1
      undef method2, method3
      undef method_with_a_long_name1, method_with_a_long_name2, method_with_a_long_name3
    end

    module Prettier; end

    module Prettier
    end

    module Prettier
      # inside module documentation
      attr_accessor :foo
    end

    class Access
      public
      def public_method; end
      protected
      def protected_method; end
      private
      def private_method; end
    end
  end
end

Pret::Tier::Object # rubocop:disable Lint/Void
Pret::TIER = 'config'.to_s

::Pret::Tier::Object # rubocop:disable Lint/Void
::PRET = 'config'.to_s
