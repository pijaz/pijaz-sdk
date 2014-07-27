Ruby example application
===========================

This example application showcases the basics of using the Pijaz SDK in [Ruby](https://www.ruby-lang.org).


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Install [RubyGems](https://rubygems.org), Ruby's package management system.
* Run `gem install pijaz-sdk json` -- this will install the SDK and all its dependencies.
* Navigate to the same directory as this README file.
* Copy config.sample.rb to config.rb
* Edit the client application settings section of config.rb, inserting the values for your configured application.
* Edit the product settings section of config.rb. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.


### Running the application

* Run `ruby example.rb` to start the application.

You should see some console output with the results of the two different products the example application produces.

