pijaz-sdk
=========

This software development kit allows end users to leverage the [Pijaz](http://pijaz.com) Synthesizer Platform to produce custom digital products.

### Initial platform setup

##### Registration

To use the platform you must first register on our [Developer site](http://developer.pijaz.com).

##### Creating a client application

Visit the [Application manager](http://developer.pijaz.com/#manage-app). Click on the 'Create app' button, give your application a name and description, then save it. Once saved, click on the 'Generate' button for the created application, which will generate an API key.

##### Creating themes

Custom themes are created and registered in our [Theme designer](http://developer.pijaz.com/#theme-designer). The easiest way to get started is by clicking the 'Create sample workflows' button, which will appear at the top of the theme designer form if you haven't created any themes yet.

### Supported languages

The SDK currently supports the following languages:

 * node.js

More information about each supported language can be found in the README file under each language's subdirectory.

### API

The API is fairly straightforward. All the class methods needed to start using the API are documented here, consult the code if you want to dig deeper. Also, note that although a best effort has been made to keep the API consistent across languages, implementation details may vary. Consult the README for the language and/or have a look at the example code.

#### Class: ServerManager

Manages the connections to the Pijaz services supported by the SDK.

The class is instantiated with a single argument, an object with the following key/value pairs:

 * **appId**: *Required*. The ID of the client application.
 * **apiKey**: *Required*. The client application API key. This key should
   be kept confidential, and is used to allow the associated client to
   access the API server.
 * **renderServer**: *Optional*. The base URL of the rendering service. Include
   the trailing slash. Default: http://render.pijaz.com/
 * **apiServer**: *Optional*. The base URL of the API service. Include
   the trailing slash. Default: http://api.pijaz.com/
 * **refreshFuzzSeconds**: *Optional*. Number of seconds to shave off the lifetime
   of a rendering access token, this allows a smooth re-request for a new
   set of access params. Default: 10
 * **apiVersion**: *Optional*. The API version to use. Currently, only version 1
   is supported. Default: 1

#### Class: Product

Manages a renderable product.

The class is instantiated with a single argument, an object with the following key/value pairs:

 * **serverManager**: *Required*. An instance of the ServerManager class.
 * **workflowId**: *Required*. The workflow ID for the product.
 * **renderParameters**: *Optional*. An object of render parameters to be included with every render request. They depend on the product, but these are typically supported params:
   * **message**: Primary message to display.
   * **font**: Font to use.
   * **quality**: Image quality to produce (0-100).

###### Method: clearRenderParameters()

Clear out all current render parameters.

Any parameters currently stored with the product, including those passed when the product was instantiated, are cleared.

###### Method: setRenderParameter(key, newValue)

Set a render parameter on the product.

Parameters:

 * **key**: The parameter name.
 * **newValue**: The parameter value.

Optionally an object of parameter key/value pairs can be passed as the first argument, and each pair will be added.

###### Method: getRenderParameter(key)

Retrieve a render parameter.

Parameters:

 * **key**: The parameter name.

###### Method: generateUrl(additionalParams)

Build a fully formed URL which can be used to make a request for the product from a rendering server.

Parameters:

 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.

###### Method: saveToFile(filepath, additionalParams)

Convenience method for saving a product directly to a file.

This takes care of generating the render URL, making the request to the render server for the product, and saving to a file.

Parameters:

 * **filepath**: *Required*. The full file path.
 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.

###### Method: serve(additionalParams)

Convenience method for serving a product directly to a browser.

This takes care of generating the render URL, making the request to the render server for the product, and passing the result to the browser.

Parameters:

 * **additionalParams**: *Optional*. An object of additional render parameters to be used for this request only.

### Code examples

The examples directory contains example code for each of the languages the SDK supports.
