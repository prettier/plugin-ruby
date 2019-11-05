# frozen_string_literal: true

# This is a small webapp whose only function is to generate the AST used by the
# ruby plugin. It will be used by the prettier playground in order to format
# stuff in ruby (since we can't do that client-side).

require 'bundler/setup'
require 'sinatra'

require_relative 'ripper'

class App < Sinatra::Base
  get '/' do
    halt 200
  end

  post '/' do
    builder = RipperJS.new(request.body.read)
    response = builder.parse

    if !response || builder.error?
      halt 422
    else
      JSON.fast_generate(response)
    end
  end
end
