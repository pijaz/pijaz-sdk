var _ = require('underscore');
var pijaz = require('pijaz-sdk');
var request = require('request');
var http = require('http');
var config = require('./config');

// Set up the server manager class.
var serverOptions = {
  appId: config.appId,
  apiKey: config.apiKey,
  renderServer: config.pijaz.renderServer,
  apiServer: config.pijaz.apiServer,
}
var server = new pijaz.ServerManager(serverOptions);


var productFactory = function() {
  // Set up the product class.
  productOptions = {
    serverManager: server,
    workflowId: config.workflowId,
  }
  var product = new pijaz.Product(productOptions);

  // Any user-generated product must include the 'xml' render parameter, which
  // is the fully qualified URL to the XML file used to generate the product.
  product.setRenderParameter({
    xml: config.workflowXmlUrl,
  });

  return product;
}

var urlProduct = productFactory();

// Other render parameters declared in the product's XML can also be supplied,
// if they are not, then default values will be used.
urlProduct.setRenderParameter({
  message: 'World',
  color: 'black',
});

// Use the generateUrl method to build a fully qualified URL for retrieving the
// product from the platform.
var urlCallback = function(err, url) {
  if (err) {
    console.log("Product URL generation error: " + String(err));
  }
  else {
    console.log("Product URL generated: " + url);
  }
}
urlProduct.generateUrl(urlCallback);

var fileProduct = productFactory();

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
fileProduct.saveToFile(filepath, fileProductOptions, fileCallback);

var requestProduct = productFactory();

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
  var requestProductOptions = {
    message: 'world request',
    color: 'purple',
  }
  requestProduct.serve(resp, requestProductOptions, requestCallback);
}

// Fire up the local example server.
var server = http.createServer(testRequest);
var listeningCallback = function() {
  console.log("Test server started. Visit http://" + config.host + ":" + config.port + " to see an image.");
}
server.on('listening', listeningCallback);
server.listen(config.port, config.host);

