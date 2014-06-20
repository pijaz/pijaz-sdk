pijaz-sdk
=========

Welcome to the pijaz SDK.  

This software development kit allows end users to leverage the [Pijaz](http://pijaz.com) Synthesizer Platform to produce custom digital products.

### Introduction

A pijaz digital product (or simply 'product' or 'theme') refers to one cloud workflow that produces variations of one type of output data stream.  A typical product can produce image files that are personalized with a variable message. However products can produce anything including images, videos, text, or json data.

Each product is described by an XML document. Adding a new product means producing a new XML document and submitting it to the pijaz server to store in the database.  

Some pijaz products are considered public where anyone is allowed to ask the pijaz servers to produce versions of it.  Most products provided by pijaz are considered public.  When you produce your own products, you are able to make them private or public.  Producing private products requires being authenticated with developer credentials.  This would typically be accomplished via server-to-server communications.

### Instant gratification:  Using public pijaz products

To see a simple example of creating personalized images from public products, open the examples/example.html file in a browser and try a few messages.  Look at the html source to see how the page uses the pijaz javascript libraries to communicate with the pijaz cloud servers.

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


### Direct server APIs

If you wish to communicate direclty with the api server and render servers, this section describes the available services.  Most are accomplished via http GET requests.

### API server commands

#####Get render server token

All requests to render a media file on a render server requires a render token.  This command generates the required render token for a workflow

Endpoint: http://api.pijaz.com/get-token

Parameters:

Key              Value
---------        -----------------
workflow         A workflow id
app_id           Should be your app id created at developer.pijaz.com
api_version      1
request_id       Unique callback id to correlate callback to request
_jsonp_callback  Callback function name

Example:

http://api.pijaz.com/get-token?workflow=web.17&app_id=10&api_version=1&request_id=1ab64ad4-3ac0-4424-ade3-552e6864d995&_jsonp_callback=_prototypeJSONPCallback_2


####User workflow requests


#####Get all workflows for authenticated user

Http method: GET

End point:  http://api.pijaz.com/user-workflow/workflows

Parameters:

Key              Value
---------        -----------------
api_version      1

Example:

http://api.pijaz.com/user-workflow/workflows?api_version=1


#####Create a new workflow

Http method: POST

End point:  http://api.pijaz.com/user-workflow/workflows

Parameters:

Key              Value
---------        -----------------
api_version      1
type             allowed values:  com.pijaz.private | com.pijaz.public
title            title associated with workflow
xml              xml for workflow


#####Update specified workflow

Http method: PUT

End point:  http://api.pijaz.com/user-workflow/workflows/[[workflow_id]]

Parameters:

Key              Value
---------        -----------------
api_version      1
type             allowed values:  com.pijaz.private | com.pijaz.public
title            title associated with workflow
xml              xml for workflow


#####Get detailed information for specified workflow

Get all detailed information about a specified workflow

Http method: GET

Parameters:

Key              Value
---------        -----------------
api_version      1

Example:

http://api.pijaz.com/user-workflow/workflows/[[workflow_id]]?api_version=1


#####Delete specified workflow

Get all detailed information about a specified workflow

Http method: DELETE

Parameters:

Key              Value
---------        -----------------
api_version      1

Example:

http://api.pijaz.com/user-workflow/workflows/[[workflow_id]]?api_version=1


#####Get xml for specified workflow

In the theme designer, each workflow shows its graph call for retrieving its xml.

Http method: GET

Parameters:

Key              Value
---------        -----------------
api_version      1

Example:

http://api.pijaz.com/user-workflow/workflows/[[workflow_id]]/xml



####Graph requests

#####Get authenticated user info

Retrieve the authenticated user info.

Http method: GET

http://api.pijaz.com/graph/me?api_version=1


#####Get summary of all workflow products

Http method: GET

http://api.pijaz.com/graph/products/summary?api_version=1


#####Get detailed info for all workflow products

Http method: GET

http://api.pijaz.com/graph/products/detail


#####Get detailed info for specified product

Http method: GET

http://api.pijaz.com/graph/product/[[product_id]]

Example:

http://api.pijaz.com/graph/product/2061?api_version=1


#####Get product categories summary

Http method: GET

http://api.pijaz.com/graph/categories/summary?api_version=1


#####Get product categories detailed info

Http method: GET

http://api.pijaz.com/graph/categories/detail?api_version=1


#####Get info for a single category by category id

Http method: GET

http://api.pijaz.com/graph/category/[[category_id]]?api_version=1


#####Get summary info of all products for a category

Http method: GET

http://api.pijaz.com/graph/category/[[category_id]]/products/summary?api_version=1


#####Get detailed info of all products for a category

Http method: GET

http://api.pijaz.com/graph/category/[[category_id]]/products/detail?api_version=1



### Render server commands

#####Get version

Get the version of the currently deployed synthesizer kernel:

Endpoint: ​http://render.pijaz.com/execute-command

Parameters:

Key              Value
---------        -----------------
command          version

Example:

​http://render.pijaz.com/execute-command?command=version


#####Get workflows

Get a list of all available workflows.

Endpoint: ​http://render.pijaz.com/execute-command

Parameters:

Key              Value
---------        -----------------
command          get-workflows
api_version      1

Example:

​http://render.pijaz.com/execute-command?command=get-workflows&api_version=1


#####Get workflow metadata:

Get the metadata for a specific widget or workflow.

Endpoint: ​http://render.pijaz.com/execute-command

Parameters:

Key              Value
---------        -----------------
command          get-widget-metadata
api_version      1
type             workflow identifier

Example:

​http://render.pijaz.com/execute-command?command=get-widget-metadata&api_version=1&type=web.1


#####Reload workflow:

If you change the xml for a workflow, reload just that workflow in the render engine.


Endpoint: ​http://render.pijaz.com/execute-command

Parameters:

Key              Value
---------        -----------------
command          reload-workflow
api_version      1
type             workflow identifier

Example:

​http://render.pijaz.com/execute-command?command=reload-workflow&api_version=1&type=web.1


