<?php

/**
 * This example illustrates how to generate a render URL and save a product
 * to a file from the command line.
 */

require_once('config.php');
require_once('PijazServerManager.class.php');

// Set up the server class.
$serverOptions = new stdClass();
$serverOptions->appId = APP_ID;
$serverOptions->apiKey = API_KEY;
$serverOptions->apiServer = API_SERVER_URL;
$serverOptions->renderServer = RENDER_SERVER_URL;
$server = new ServerManager($serverOptions);

// Set up the product class.
$productOptions = new stdClass();
$productOptions->serverManager = $server;
$productOptions->workflowId = WORKFLOW_ID;
$product = new Product($productOptions);

// Any user-generated product must include the 'xml' render parameter, which
// is the fully qualified URL to the XML file used to generate the product.
// Using setRenderParameter() ensures it will be included in all product
// generation requests.
$renderParameterOptions = new stdClass();
$renderParameterOptions->xml = WORKFLOW_XML_URL;
$product->setRenderParameter($renderParameterOptions);

// Other render parameters declared in the product's XML can also be supplied,
// if they are not, then default values will be used. Passing them as an
// argument to generateUrl means these parameters will only be used for this
// generation request.
$productOptions = new stdClass();
$productOptions->message = 'world';
$productOptions->color = 'black';
$url = $product->generateUrl($productOptions);
if ($url) {
  $message = "URL: " . $url;
}
else {
  $message = "URL generation error";
}
echo "\n$message\n";


// The saveToFile method provides a convenient way to save a product to a file.
$fileProductOptions = new stdClass();
$fileProductOptions->message = 'world file';
$fileProductOptions->color = 'yellow';
$result = $product->saveToFile(IMAGE_FILEPATH, $fileProductOptions);
if ($result) {
  $message = "Product file saved to: " . IMAGE_FILEPATH;
}
else {
  $message = "Product file save error";
}
echo "\n$message\n";

