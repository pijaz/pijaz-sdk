PHP example application
===========================

This example application showcases the basics of using the Pijaz SDK in PHP.


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Make sure PijazServerManager.class.php and PijazProduct.class.php are in your PHP's include path.
* Navigate to the same directory as this README file.
* Copy config.sample.php to config.php
* Edit the client application settings section of config.php, inserting the values for your configured application.
* Edit the product settings section of config.php. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.


### Running the application

#### For the CLI script.

* Run `php cli.php` to start the application.

You should see some console output with the results of the two different products the example application produces.

#### For the server script.

* Make sure server.php is accessible via you PHP-enabled web server
* Visit server.php via your web browser

You should see a product rendered directly to the browser.
