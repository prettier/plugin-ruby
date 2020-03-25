# Playground

This directory stores a small web app that runs on heroku that when posted to will return the AST of the posted code.

## Local

You can start it locally with:

```
bundle install
bundle exec rackup
```

This will start a local server on `http://localhost:9292`. You can then test it out by hitting it with curl, as in:

```
curl -X POST -d 'foo' http://localhost:9292
```

## Remote

You can use the deployed version on heroku with the same curl command as above, but using the heroku URL, as in:

```
curl -X POST -d 'foo' https://prettier-ruby.herokuapp.com
```

## Deploy

To deploy this app to heroku, use the `playground/deploy` bash script. Basically it just `git push`s to heroku using the `playground` subtree, provided the `playground/parser.rb` file is synced up with the one from `src/parser.rb`.
