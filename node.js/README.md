Pijaz node.js SDK
=================

Pijaz SDK for node.js.


### Initial platform setup

See [Initial platform setup](https://github.com/pijaz/pijaz-sdk#initial-platform-setup) in the main README for the SDK.


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

Convenience method for serving a product directly to a browser.

This takes care of generating the render URL, making the request to the render server for the product, and passing the result to the browser.

Parameters:

 * **response**: *Required*. The request response object.
 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.
 * **callback**: *Optional*. A function to call after saving the file. The callback is passed the string 'success' upon successful file save.

