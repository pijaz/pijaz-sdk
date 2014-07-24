Python example application
===========================

This example application showcases the basics of using the Pijaz SDK in [Python](https://www.python.org).


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Make sure the pijaz SDK module is in your Python's include path.
* Navigate to the same directory as this README file.
* Copy config.sample.py to config.py
* Edit the client application settings section of config.py, inserting the values for your configured application.
* Edit the product settings section of config.py. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.
* The library uses the third-party [Requests](http://docs.python-requests.org/en/latest/) support library, so this must be importable.


### Running the application

* Run `python example.py` to start the application.

You should see some console output with the results of the two different products the example application produces.

