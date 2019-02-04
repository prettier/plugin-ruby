# frozen_string_literal: true

module Pret
  module Tier
    class Object; end

    class Object
    end

    class Object
      attr_accessor :foo
    end

    class Object < BasicObject; end

    class Object < BasicObject
    end

    class Object < BasicObject
      attr_accessor :bar
    end

    class << self
      def method; end

      undef method
    end
  end
end

Pret::Tier::Object # rubocop:disable Lint/Void
Pret::TIER = 'config'.freeze

::Pret::Tier::Object # rubocop:disable Lint/Void
::PRET = 'config'.freeze
