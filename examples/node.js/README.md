node.js example application
===========================

This example application showcases the basics of using the Pijaz SDK in node.js.


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


### Application configuration

* Navigate to the same directory as this README file.
* Run `npm install` to install the dependencies for the application.
* Copy config.sample.js to config.js
* Edit the client application settings section of config.js, inserting the values for your configured application.
* Edit the product settings section of config.js. The example application expects a workflow that's identical to the 'Hello World' sample workflow created in the Theme designer.


### Running the application

* Run `node app.js` to start the application.

You should see some console output with the results of the three different products the example application produces.

### API

The main API documentation resides in the [README](https://github.com/pijaz/pijaz-sdk#api) for the SDK.

Node's async nature requires a different implementation for some methods; the changes in functionality and argument signature are noted below.

In typical node fashion, all callback functions have an error argument as their first argument, which is null if there was no error, and contains error information if an error occurred.

#### Class: Product

###### Method: generateUrl(callback, additionalParams)

Parameters:

 * **callback**: *Required*. A function to call after generating the URL. The callback is passed the URL.
 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.

###### Method: saveToFile(filepath, additionalParams, callback)

Parameters:

 * **filepath**: *Required*. The full file path.
 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.
 * **callback**: *Optional*. A function to call after saving the file. The callback is passed the string 'success' upon successful file save.

###### Method: serve(response, additionalParams, callback)

Parameters:

 * **response**: *Required*. The request response object.
 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.
 * **callback**: *Optional*. A function to call after saving the file. The callback is passed the string 'success' upon successful file save.

