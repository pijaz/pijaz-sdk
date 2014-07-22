Lua example application
===========================

This example application showcases the basics of using the Pijaz SDK in [Lua](http://www.lua.org).


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Make sure pijaz.lua, pijaz_server_manager.lua and pijaz_product.lua are in your Lua's include path.
* Navigate to the same directory as this README file.
* Copy config.sample.lua to config.lua
* Edit the client application settings section of config.lua, inserting the values for your configured application.
* Edit the product settings section of config.lua. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.


### Running the application

* Run `lua example.lua` to start the application.

You should see some console output with the results of the two different products the example application produces.

