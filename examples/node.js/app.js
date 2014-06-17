//This node.js app demonstrates three ways to generate an image via a pijaz product workflow:
//
//   1. As an image served to http://localhost:8000
//   2. As a url that can then be used in places like an <img> src tag.
//   3. As a saved temporary file

var _ = require('underscore');
var pijaz = require('pijaz-sdk');
var request = require('request');
var http = require('http');
var config = require('./config');

// Some sanity checks.
var checkConfig = function(key) {
  var value = config[key];
  if (!_.isString(value) || _.isEmpty(value)) {
    throw("Invalid config, missing value for parameter '" + key + "', must be a non-empty string. Edit config.js to correct the issue.");
  }
}
var keys = [
  'appId',
  'apiKey',
  'workflowId',
  'workflowXmlUrl',
  'filepath',
];
_.each(keys, checkConfig);

// Set up the server manager class.
var serverOptions = {
  appId: config.appId,
  apiKey: config.apiKey,
  renderServer: config.pijaz.renderServer,
  apiServer: config.pijaz.apiServer,
}
var server = new pijaz.ServerManager(serverOptions);

// Set up the product class.
productOptions = {
  serverManager: server,
  workflowId: config.workflowId,
}
var product = new pijaz.Product(productOptions);

// Any user-generated product must include the 'xml' render parameter, which
// is the fully qualified URL to the XML file used to generate the product.
// Using setRenderParameter() ensures it will be included in all product
// generation requests.
product.setRenderParameter({
  xml: config.workflowXmlUrl,
});

// Use the generateUrl method to build a fully qualified URL for retrieving the
// product from the platform.
var urlCallback = function(err, url) {
  if (err) {
    console.log("Product URL generation error: " + String(err));
  }
  else {
    console.log("Product URL to generate image (e.g. can be used as an <img> source tag): " + url);
  }
}
// Other render parameters declared in the product's XML can also be supplied,
// if they are not, then default values will be used. Passing them as an
// argument to generateUrl means these parameters will only be used for this
// generation request.
var productOptions = {
  message: 'world',
  color: 'black',
}
product.generateUrl(urlCallback, productOptions);

// The saveToFile method provides a convenient way to save a product to a file.
var filepath = config.filepath;
var fileCallback = function(err, status) {
  var message;
  if (err) {
    message = "Product file save error";
  }
  else {
    message = "Product file saved to: " + filepath;
  }
  console.log(message);
}
var fileProductOptions = {
  message: 'world file',
  color: 'yellow',
}
product.saveToFile(filepath, fileProductOptions, fileCallback);

// Global request listener for our example server.
var testRequest = function (req, resp) {
  // The serve method provides a convenient way to serve a product directly to
  // the browser.
  var requestCallback = function(err, status) {
    var message;
    if (err) {
      message = "Product request error";
    }
    else {
      message = "Product request served";
    }
    console.log(message);
  }
  
  // Note that product options could easily be supplied by url parameters 
  // or other dynamic sources
  var requestProductOptions = {
    message: 'world request',
    color: 'purple',
  }
  product.serve(resp, requestProductOptions, requestCallback);
}

// Fire up the local example server.
var server = http.createServer(testRequest);
var listeningCallback = function() {
  console.log("Test server started. Visit http://" + config.host + ":" + config.port + " to see an image.");
}
server.on('listening', listeningCallback);
server.listen(config.port, config.host);

