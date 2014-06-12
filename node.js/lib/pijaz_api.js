var _ = require('underscore');
var qs = require('querystring');
var https = require('https');
var uuid = require('uuid');
var request = require('request');
var fs = require('fs');

var DEFAULT_RENDER_SERVER = 'http://render.pijaz.com/';
var DEFAULT_API_SERVER = 'http://api.pijaz.com/';

// How many times to try a specific request before failing.
var SERVER_REQUEST_ATTEMPTS = 2;


/**
 * Class: ServerManager
 *
 * Server manager class, used for making calls to a Pijaz API service and/or
 * rendering service.
 *
 * Parameters:
 *   appId: Required. The ID of the client application.
 *   apiKey: Required. The API key associated with the client. This key should
 *     be kept confidential, and is used to allow the associated client to
 *     access the API server.
 *   renderServer: Optional. The base URL of the rendering service. Include
 *     the trailing slash. Default: http://render.pijaz.com/
 *   apiServer: Optional. The base URL of the API service. Include
 *     the trailing slash. Default: http://api.pijaz.com/
 *   refreshFuzzSeconds: Optional. Number of seconds to shave off the lifetime
 *     of a rendering access token, this allows a smooth re-request for a new
 *     set of access params. Default: 10
 *   apiVersion: Optional. The API version to use. Currently, only version 1
 *     is supported. Default: 1
 */
var ServerManager = function(inParameters) {
  this.apiVersion = 1;

  var defaultParameters = {
    appId: null,
    apiKey: null,
    renderServer: DEFAULT_RENDER_SERVER,
    apiServer: DEFAULT_API_SERVER,
    refreshFuzzSeconds: 10,
    apiVersion: this.apiVersion,
  }

  this.parameters = _.extend(defaultParameters, inParameters);

  this.requests = {};
}

/**
 * Method: getApiVersion
 *
 * Get the API version the server manager is using.
 */
ServerManager.prototype.getApiVersion = function() {
  return this.parameters.apiVersion;
}


/**
 * Method: getRenderServerUrl
 *
 * Get current render server URL.
 */
ServerManager.prototype.getRenderServerUrl = function() {
  return this.parameters.renderServer;
}

/**
 * Method: getApiServerUrl
 *
 * Get current API server URL.
 */
ServerManager.prototype.getApiServerUrl = function() {
  return this.parameters.apiServer;
}

/**
 * Method: getAppId
 *
 * Get the client application ID.
 */
ServerManager.prototype.getAppId = function() {
  return this.parameters.appId;
}

/**
 * Method: getApiKey
 *
 * Get the API key of the client application.
 */
ServerManager.prototype.getApiKey = function() {
  return this.parameters.apiKey;
}

/**
 * Method: sendApiCommand
 *
 * Send a command to the API server and delegate response.
 *
 * Parameters:
 *
 *   command: Required. The command to send to the API server. One of the
 *     following:
 *       get-token: Retrieve a rendering access token for a workflow.
 *         commandParameters:
 *           workflow: The workflow ID.
 *
 *   commandParameters: Optional. See individual command for more information
 *   callback: Required. Function to invoke upon completion of command
 *     execution.
 *   method: Optional. The HTTP request type. Default: GET
 */
ServerManager.prototype.sendApiCommand = function(inParameters) {
  var url = this.parameters.apiServer + inParameters.command;
  var method = _.isUndefined(inParameters.method) ? 'GET' : inParameters.method.toUpperCase();

  inParameters.commandParameters.app_id = this.getAppId();
  inParameters.commandParameters.api_key = this.getApiKey();
  inParameters.commandParameters.api_version = this.getApiVersion();

  // If an existing request handler was already created, use it,
  // otherwise make one.
  var handlerObject;
  if (_.isUndefined(inParameters.commandParameters.request_id)) {
    handlerObject = {
      'api_server_requests': 1,
    }
    inParameters.commandParameters.request_id = this.createRequestHandler(handlerObject);
  }
  else {
    handlerObject = this.retrieveRequestHandlerById(inParameters.commandParameters.request_id);
    // If api_server_requests is already populated, it's a retry.
    if (_.isUndefined(handlerObject.api_server_requests)) {
      this.addRequestHandlerProperty(handlerObject, 'api_server_requests', 1);
    }
  }

  // DEBUG.
  //console.log("uuid: " + inParameters.commandParameters.request_id + ", command: " + inParameters.command);

  var apiCommandResponse = _.bind( this._apiCommandResponse, this, inParameters);

  var options = {
    url: url,
    method: method,
  };
  if (method == 'GET') {
    options.qs = inParameters.commandParameters;
  }
  else if (method == 'POST') {
    options.json = inParameters.commandParameters;
  }
  request(options, apiCommandResponse);
}

ServerManager.prototype._apiCommandResponse = function(inParameters, err, response, json) {
  if (!err && !_.isObject(json)) {
    json = JSON.parse(json);
  }
  var callback = inParameters.callback;
  if (!err && response.statusCode == 200) {
    if (json.result.result_num == 0) {
      var handlerObject = this.retrieveRequestHandler(json);
      this.removeRequestHandlerProperty(handlerObject, 'api_server_requests');
      callback(null, json);
    }
    else {
      callback(json.result.result_text, json);
    }
  }
  else {
    var handlerObject = this.retrieveRequestHandlerById(inParameters.commandParameters.request_id);
    if (handlerObject) {
      if (handlerObject.api_server_requests && handlerObject.api_server_requests < SERVER_REQUEST_ATTEMPTS) {
        this.addRequestHandlerProperty(handlerObject, 'api_server_requests', handlerObject.api_server_requests + 1);
        this.sendApiCommand(inParameters);
      }
      else {
        this.removeRequestHandlerProperty(handlerObject, 'api_server_requests');
        callback(error, json);
      }
    }
    else {
      callback(error, json);
    }
  }
}

/**
 * Method:  buildRenderCommand
 *
 * Manage access control for a render command, and if access can be established
 * construct a fully formed render command to the render server and delegate
 * this to the caller's callback function.
 *
 * Parameters:
 *
 *   product: An instance of the Product class
 *   renderParameters: An object of all params sent to render request.
 *   callback: Required. Function to invoke upon completion of command
 *     execution. Receives an object of query parameters to pass to the
 *     rendering server.  These can be converted into a full URL by calling
 *     buildRenderServerUrlRequest(params).
 */
ServerManager.prototype.buildRenderCommand = function(inParameters) {
  if (this._isRenderRequestAllowed(inParameters.product)) {
    inParameters.callback(null, this._buildRenderServerQueryParams(inParameters));
  } else {
    var processGetTokenProc = _.bind( this._processGetTokenProc, this, inParameters);
    var commandParameters = { workflow: inParameters.renderParameters.workflow }
    if ( inParameters.renderParameters.xml ) {
      commandParameters.xml = inParameters.renderParameters.xml;
    }
    this.sendApiCommand({
      command: "get-token",
      commandParameters: commandParameters,
      callback: processGetTokenProc,
    });
  }
}

ServerManager.prototype._processGetTokenProc = function(inParameters, err, json) {
  if (!err && json.result.result_num == 0) {
    var accessInfo = new Object();

    // Store the time the access params were obtained -- used to count
    // against the lifetime param to expire the object.
    accessInfo.timestamp = this.currentTimestamp();
    // Extract the lifetime param, no need to pass this along to the
    // rendering server.
    accessInfo.lifetime = parseInt(json.info.lifetime);
    delete json.info.lifetime;

    accessInfo.renderAccessParameters = json.info;

    inParameters.product.setAccessInfo(accessInfo);

    inParameters.callback(null, this._buildRenderServerQueryParams(inParameters));
  }
  else {
    if (err) {
      inParameters.callback(err, json);
    }
    else {
      inParameters.callback(json.result.result_text, json);
    }
  }
}

/*
 * Construct a URL with all user supplied and constructed parameters
 */
ServerManager.prototype._buildRenderServerQueryParams = function(inParameters) {
    var accessInfo = inParameters.product.getAccessInfo();

    var params = _.extend(accessInfo.renderAccessParameters, inParameters.renderParameters);
    return params;
}

/*
 * Method: buildRenderServerUrlRequest
 *
 * Builds a fully qualified render request URL.
 *
 * Parameters:
 *   params: An object of query parameters for the render request.
 */
ServerManager.prototype.buildRenderServerUrlRequest = function(params) {
  var url = this.parameters.renderServer + "render-image?" + qs.stringify(params);
  return url;
}

/*
 * Verifies that valid access parameters are attached to the product.
 */
ServerManager.prototype._isRenderRequestAllowed = function(product) {
  var accessInfo = product.getAccessInfo();

  if (_.isObject(accessInfo)) {
    var expire_timestamp = accessInfo.timestamp + accessInfo.lifetime - this.parameters.refreshFuzzSeconds;
    if (this.currentTimestamp() <= expire_timestamp) {
      return true;
    }
  }
  return false;
}

/*
 * Method: createRequestHandler
 *
 * Create a unique handler for a server request.
 *
 * Parameters:
 *   handlerObject: The request handler object.
 */
ServerManager.prototype.createRequestHandler = function(handlerObject) {
  var u = uuid.v4();
  this.requests[u] = handlerObject;
  // Embed the uuid in the handler object.
  this.requests[u].uuid = u;
  return u;
}

/*
 * Method: addRequestHandlerProperty
 *
 * Add a property to a request handler object.
 *
 * Parameters:
 *   handlerObject: The request handler object.
 *   property: The property name.
 *   value: The property value.
 */
ServerManager.prototype.addRequestHandlerProperty = function(handlerObject, property, value) {
  if (_.isObject(handlerObject)) {
    var uuid = handlerObject.uuid;
    if (uuid && _.isObject(this.requests[uuid])) {
      this.requests[uuid][property] = value;
      return handlerObject;
    }
  }
}

/*
 * Method: removeRequestHandlerProperty
 *
 * Remove a property from a request handler object.
 *
 * Parameters:
 *   handlerObject: The request handler object.
 *   property: The property name.
 */
ServerManager.prototype.removeRequestHandlerProperty = function(handlerObject, property) {
  if (_.isObject(handlerObject)) {
    var uuid = handlerObject.uuid;
    if (uuid && _.isObject(this.requests[uuid])) {
      delete this.requests[uuid][property];
      // Only property remaining is the uuid, safe to clean up this
      // request object.
      if (_.size(this.requests[uuid]) == 1) {
        delete this.requests[uuid];
        return
      }
      return handlerObject;
    }
  }
}

/**
 * Method: retrieveRequestHandlerById
 *
 * Retrieves a request handler based on its unique identifier.
 *
 * Parameters:
 *   uuid: The unique identifier.
 */
ServerManager.prototype.retrieveRequestHandlerById = function(uuid) {
  if (_.isObject(this.requests[uuid])) {
    var handlerObject = this.requests[uuid];
    return handlerObject;
  }
}

/**
 * Method: retrieveRequestHandler
 *
 * Retrieves a request handler from an API server response object.
 *
 * Parameters:
 *   jsonResult: An API server response object.
 */
ServerManager.prototype.retrieveRequestHandler = function(jsonResult) {
  if (_.isObject(jsonResult) && !_.isUndefined(jsonResult.request_id)) {
    var uuid = jsonResult.request_id;
    return this.retrieveRequestHandlerById(uuid);
  }
}

/*
 * Returns the current Unix time
 */
ServerManager.prototype.currentTimestamp = function() {
  var dateobj = new Date;
  var timestamp = parseInt(dateobj.getTime() / 1000);
  return timestamp;
}

/**
 * Class: Product
 *
 * Manages a renderable product.
 *
 * Parameters:
 *
 *   serverManager: Required. An instance of the ServerManager class.
 *   workflowId: Required. The workflow ID for the product.
 *   renderParameters: Optional. An object of render parameters to be included
 *     with every render request. They depend on the product, but these are
 *     typically supported params:
 *       message: Primary message to display.
 *       font: Font to use.
 *       halign: Horizontal justification (left, center, right, full).
 *       valign: Vertical justification (top, middle, bottom, full, even).
 *       quality: Image quality to produce (0-100).
 */
var Product = function(inParameters) {
  var defaultParams = {
    renderParameters: {},
  }

  this.parameters = _.extend(defaultParams, inParameters);
  this.productPropertyDefaults = this.parameters.productPropertyDefaults || {};
}

/**
 * Method: getWorkflowId
 *
 * Return the workflow ID.
 */
Product.prototype.getWorkflowId = function() {
    return this.parameters.workflowId;
}


/**
 * Method: setWorkflowId
 *
 * Set the workflow ID.
 */
Product.prototype.setWorkflowId = function(newWorkflowId) {
  if (this.parameters.workflowId != newWorkflowId ) {
    delete this.accessInfo;
    this.parameters.workflowId = newWorkflowId;
  }
}

/**
 * Method: clearRenderParameters
 *
 * Clear out all current render parameters.
 *
 * Any parameters currently stored with the product, including those passed
 * when the product was instantiated, are cleared.
 */
Product.prototype.clearRenderParameters = function() {
  this.parameters.renderParameters = {};
}

/**
 * Method: getAccessInfo (required by ServerManager).
 *
 * Return the access info for the product.
 */
Product.prototype.getAccessInfo = function() {
  return this.accessInfo;
}

/**
 * Method: setAccessInfo (required by ServerManager).
 *
 * Set the access info for the product.
 */
Product.prototype.setAccessInfo = function(accessInfo) {
  if (typeof accessInfo == 'object') {
    this.accessInfo = accessInfo;
  }
  else {
    delete this.accessInfo;
  }
}

/**
 * Method: setRenderParameter
 *
 * Set a render parameter on the product.
 *
 * Parameters:
 *   key: The parameter name.
 *   newValue: The parameter value.
 *
 * Optionally an object of parameter key/value pairs can be passed as the
 * first argument, and each pair will be added.
 */
Product.prototype.setRenderParameter = function(key, newValue) {
  if (_.isObject(key)) {
  var values = key;
  for( k in values ) {
    this.setRenderParameter(k, values[k]);
  }
  }
  else {
    if ( this.parameters.renderParameters[key] != newValue ) {
      if (_.isNull(newValue) || newValue == this.productPropertyDefaults[key]) {
        delete this.parameters.renderParameters[key];
      }
      else {
        this.parameters.renderParameters[key] = newValue;
      }
    }
  }
}

/**
 * Method: getRenderParameter
 *
 * Retrieve a render parameter.
 *
 * Parameters:
 *   key: The parameter name.
 */
Product.prototype.getRenderParameter = function(key) {
  var value = this.parameters.renderParameters[key];
  if (_.isUndefined(value)) {
    value = this.productPropertyDefaults[key];
  }
  return value;
}

/**
 * Method: generateUrl
 *
 * Build a fully formed URL which can be used to make a request for the
 * product from a rendering server.
 *
 * Parameters:
 *   callback: Required. A function to call after generating the URL. The
 *     callback is passed the URL.
 *   additionalParams: An object of additional render parameters to be used
 *     for this request only.
 */
Product.prototype.generateUrl = function(callback, additionalParams) {
  additionalParams = _.isEmpty(additionalParams) ? {} : additionalParams;
  var finalParams = this.setFinalParams(additionalParams);

  this.parameters.serverManager.buildRenderCommand({
    product: this,
    renderParameters: finalParams,
    callback: _.bind(this._generateUrlCallback, this, callback),
  });
}

Product.prototype._generateUrlCallback = function(callback, err, params) {
  if (err) {
    return callback(err, params);
  }
  else {
    var url = this.parameters.serverManager.buildRenderServerUrlRequest(params);
    return callback(null, url);
  }
}

/**
 * Method: saveToFile
 *
 * Convenience method for saving a product directly to a file.
 *
 * This takes care of generating the render URL, making the request to the
 * render server for the product, and saving to a file.
 *
 * Parameters:
 *   filepath: Required. The full file path.
 *   additionalParams: Optional. An object of additional render parameters to be
 *   used for this request only.
 *   callback: Optional. A function to call after saving the file. The callback
 *   is passed the string 'success' upon successful file save.
 */
Product.prototype.saveToFile = function(filepath, additionalParams, callback) {
  var _callback = function(err, url) {
    if (err) {
      if (_.isFunction(callback)) {
        return callback(err, url);
      }
    }
    else {
      var writer = fs.createWriteStream(filepath);
      var finished = function() {
        if (_.isFunction(callback)) {
          return callback(null, 'success');
        }
      }
      writer.on('finish', finished);
      request(url).pipe(writer);
    }
  }
  this.generateUrl(_callback, additionalParams);
}


/**
 * Method: serve
 *
 * Convenience method for serving a product directly to a browser.
 *
 * This takes care of generating the render URL, making the request to the
 * render server for the product, and passing the result to the response
 * object.
 *
 * Parameters:
 *   response: Required. The request response object.
 *   additionalParams: Optional. An object of additional render parameters to be
 *   used for this request only.
 *   callback: Optional. A function to call after saving the file. The callback
 *   is passed the string 'success' upon successful file save.
 */
Product.prototype.serve = function(response, additionalParams, callback) {
  var _callback = function(err, url) {
    if (err) {
      if (_.isFunction(callback)) {
        return callback(err, url);
      }
    }
    else {
      var finished = function() {
        if (_.isFunction(callback)) {
          return callback(null, 'success');
        }
      }
      response.on('finish', finished);
      request(url).pipe(response);
    }
  }
  this.generateUrl(_callback, additionalParams);
}

/**
 * Method: setFinalParams
 *
 * Set the final render parameters for the product.
 *
 * Parameters:
 *   additionalParams: An object of additional render parameters.
 */
Product.prototype.setFinalParams = function(additionalParams) {
  var finalParams;
  if (_.isObject(additionalParams)) {
    finalParams = _.extend( this.parameters.renderParameters, additionalParams )
  } else {
    finalParams = this.parameters.renderParameters;
  }
  finalParams.workflow = this.parameters.workflowId;
  return finalParams;
}

module.exports = {
  ServerManager: ServerManager,
  Product: Product,
};
