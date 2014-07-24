Python example application
===========================

This example application showcases the basics of using the Pijaz SDK in [Python](https://www.python.org).


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Navigate to the same directory as this README file.
* Run `python setup.py develop`. This will install the SDK and all dependencies. It's recommended that you do this in a [virtualenv](http://virtualenv.readthedocs.org/en/latest).
* Copy config.sample.py to config.py
* Edit the client application settings section of config.py, inserting the values for your configured application.
* Edit the product settings section of config.py. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.


### Running the application

* Run `python example.py` to start the application.

You should see some console output with the results of the two different products the example application produces.

