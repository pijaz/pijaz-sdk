<?php

/**
 * This example illustrates how to render a product directly to the browser.
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
$productOptions->renderParameters = new stdClass();
$productOptions->renderParameters->xml = WORKFLOW_XML_URL;
$product = new Product($productOptions);

// The serve method provides a convenient way to render a product to the
// browser.
$serveProductOptions = new stdClass();
$serveProductOptions->message = 'world request';
$serveProductOptions->color = 'purple';
$result = $product->serve($serveProductOptions);

