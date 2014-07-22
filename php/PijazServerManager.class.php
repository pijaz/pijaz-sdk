<?php

/**
 * PUBLIC METHODS:
 *
 * __construct($inParameters)
 * buildRenderCommand($inParameters)
 * buildRenderServerUrlRequest($inParamaters)
 * getApiKey()
 * getApiServerUrl()
 * getApiVersion()
 * getAppId()
 * getRenderServerUrl()
 * sendApiCommand($inParameters)
 *
 * PRIVATE METHODS:
 *
 * _buildRenderServerQueryParams($params)
 * _extractInfo($data)
 * _extractResult($data)
 * _httpRequest($url, $headers, $method, $data, $retry)
 * _isRenderRequestAllowed($product)
 * _processAccessToken($params, $data)
 * _sendApiCommand($params, $retry)
 */

define("PIJAZ_API_VERSION", "1");
define("PIJAZ_API_SERVER", "http://api.pijaz.com/");
define("PIJAZ_RENDER_SERVER", "http://render.pijaz.com/");
define("SERVER_REQUEST_ATTEMPTS", 2);

/**
 * Class: PijazServerManager
 *
 * Server manager class, used for making calls to a Pijaz API service and/or
 * rendering service.
 *
 * Parameters:
 *
 *   inParameters: An object with the following key/value pairs.
 *     appId: Required. The ID of the client application.
 *     apiKey: Required. The API key associated with the client. This key should
 *       be kept confidential, and is used to allow the associated client to
 *       access the API server.
 *     renderServer: Optional. The base URL of the rendering service. Include
 *       the trailing slash. Default: http://render.pijaz.com/
 *     apiServer: Optional. The base URL of the API service. Include
 *       the trailing slash. Default: http://api.pijaz.com/
 *     refreshFuzzSeconds: Optional. Number of seconds to shave off the lifetime
 *       of a rendering access token, this allows a smooth re-request for a new
 *       set of access params. Default: 10
 *     apiVersion: Optional. The API version to use. Currently, only version 1
 *       is supported. Default: 1
 */
class PijazServerManager {

  public $apiServer = PIJAZ_API_SERVER;
  public $renderServer = PIJAZ_RENDER_SERVER;
  public $refreshFuzzSeconds = 10;
  public $apiVersion = 1;
  public $appId;
  public $apiKey;

  /**
   * PUBLIC METHODS.
   */

  public function __construct($inParameters) {
    $params = (object) $inParameters;
    $this->appId = $params->appId;
    $this->apiKey = $params->apiKey;
    if (isset($params->apiServer)) {
      $this->apiServer = $params->apiServer;
    }
    if (isset($params->renderServer)) {
      $this->renderServer = $params->renderServer;
    }
    if (isset($params->refreshFuzzSeconds)) {
      $this->refreshFuzzSeconds = $params->refreshFuzzSeconds;
    }
    if (isset($params->apiVersion)) {
      $this->apiVersion = $params->apiVersion;
    }
  }

  /**
   * Build the set of query parameters for a render request.
   *
   * inParameters: An object with the following key/value pairs.
   *
   *   product: An instance of the PijazProduct class
   *   renderParameters: An object of all params sent to the render request.
   *
   * Return:
   *     If successful, an object of query parameters to pass to the rendering
   *     server. These can be converted into a full URL by calling
   *     buildRenderServerUrlRequest(params).
   */
  public function buildRenderCommand($inParameters) {
    $params = (object) $inParameters;
    if ($this->_isRenderRequestAllowed($params->product)) {
      return $this->_buildRenderServerQueryParams($params);
    } else {
      $commandParameters = new stdClass();
      $commandParameters->workflow = $params->renderParameters->workflow;
      if (isset($params->renderParameters->xml)) {
        $commandParameters->xml = $params->renderParameters->xml;
      }
      $options = new stdClass();
      $options->command = 'get-token';
      $options->commandParameters = $commandParameters;
      $result = $this->sendApiCommand($options);
      if ($result->success) {
        return $this->_processAccessToken($params, $result->data);
      }
    }
  }

  /*
   * Builds a fully qualified render request URL.
   *
   * Parameters:
   *   inParameters: An object of query parameters for the render request.
   *
   * Return:
   *   The constructed URL.
   */
  public function buildRenderServerUrlRequest($inParameters) {
    $url = $this->getRenderServerUrl() . "render-image?" . http_build_query($inParameters);
    return $url;
  }

  /**
   * Get the API key of the client application.
   *
   * Return:
   *   The client API key.
   */
  public function getApiKey() {
    return $this->apiKey;
  }

  /**
   * Get current API server URL.
   *
   * Return:
   * The API server URL.
   */
  public function getApiServerUrl() {
    return $this->apiServer;
  }

  /**
   * Get the API version the server manager is using.
   *
   * Return:
   *   The API version.
   */
  public function getApiVersion() {
    return $this->apiVersion;
  }

  /**
   * Get the client application ID.
   *
   * Return:
   *   The application ID.
   */
  public function getAppId() {
    return $this->appId;
  }

  /**
   * Get current render server URL.
   *
   * Return:
   *   The render server URL.
   */
  public function getRenderServerUrl() {
    return $this->renderServer;
  }

  /**
   * Send a command to the API server.
   *
   * inParameters: An object with the following key/value pairs.
   *
   *   command: Required. The command to send to the API server. One of the
   *     following:
   *       get-token: Retrieve a rendering access token for a workflow.
   *         commandParameters:
   *           workflow: The workflow ID.
   *
   *   commandParameters: Optional. An object of parameters. See individual
   *     command for more information
   *   method: Optional. The HTTP request type. Default: GET
   *
   * Return:
   *   An object with the following key/value pairs;
   *     success: TRUE if the request succeed, FALSE otherwise.
   *     data: If the request was successful, an object containing the
   *     response data, if not, a string containing the error message.
   */
  public function sendApiCommand($inParameters) {
    return $this->_sendApiCommand($inParameters, SERVER_REQUEST_ATTEMPTS - 1);
  }

  /**
   * PRIVATE METHODS.
   */

  /*
   * Construct a URL with all user supplied and constructed parameters
   */
  private function _buildRenderServerQueryParams($params) {
    $accessInfo = $params->product->getAccessInfo();
    $queryParams = clone $accessInfo->renderAccessParameters;
    if (is_object($params->renderParameters)) {
      foreach ($params->renderParameters as $key => $value) {
        $queryParams->$key = $value;
      }
    }
    return $queryParams;
  }

  /**
   * Extract the information from a server JSON response.
   */
  private function _extractInfo($data) {
    $json = json_decode($data);
    if (isset($json->result->result_num) && $json->result->result_num == 0) {
      return $json->info;
    }
    return FALSE;
  }

  /**
   * Extract the result from a server JSON response.
   */
  private function _extractResult($data) {
    $json = json_decode($data);
    if (isset($json->result->result_num) && isset($json->result->result_text)) {
      return $json->result;
    }
    return FALSE;
  }

  /**
   * Perform an HTTP request.
   *
   * This is a flexible and powerful HTTP client implementation. Correctly handles
   * GET, POST, PUT or any other HTTP requests. Handles redirects.
   *
   * Borrowed from Drupal.
   *
   * @param $url
   *   A string containing a fully qualified URI.
   * @param $headers
   *   An array containing an HTTP header => value pair.
   * @param $method
   *   A string defining the HTTP request to use.
   * @param $data
   *   A string containing data to include in the request.
   * @param $retry
   *   An integer representing how many times to retry the request in case of a
   *   redirect.
   * @return
   *   An object containing the HTTP request headers, response code, headers,
   *   data and redirect status.
   */
  private function _httpRequest($url, $headers = array(), $method = 'GET', $data = NULL, $retry = 3) {
    $result = new stdClass();

    // Parse the URL and make sure we can handle the schema.
    $uri = parse_url($url);

    if ($uri == FALSE) {
      $result->error = 'unable to parse URL';
      return $result;
    }

    if (!isset($uri['scheme'])) {
      $result->error = 'missing schema';
      return $result;
    }

    switch ($uri['scheme']) {
      case 'http':
        $port = isset($uri['port']) ? $uri['port'] : 80;
        $host = $uri['host'] . ($port != 80 ? ':'. $port : '');
        $fp = @fsockopen($uri['host'], $port, $errno, $errstr, 15);
        break;
      case 'https':
        // Note: Only works for PHP 4.3 compiled with OpenSSL.
        $port = isset($uri['port']) ? $uri['port'] : 443;
        $host = $uri['host'] . ($port != 443 ? ':'. $port : '');
        $fp = @fsockopen('ssl://'. $uri['host'], $port, $errno, $errstr, 20);
        break;
      default:
        $result->error = 'invalid schema '. $uri['scheme'];
        return $result;
    }

    // Make sure the socket opened properly.
    if (!$fp) {
      // When a network error occurs, we use a negative number so it does not
      // clash with the HTTP status codes.
      $result->code = -$errno;
      $result->error = trim($errstr);

      return $result;
    }

    // Construct the path to act on.
    $path = isset($uri['path']) ? $uri['path'] : '/';
    if (isset($uri['query'])) {
      $path .= '?'. $uri['query'];
    }

    // Create HTTP request.
    $defaults = array(
      // RFC 2616: "non-standard ports MUST, default ports MAY be included".
      // We don't add the port to prevent from breaking rewrite rules checking the
      // host that do not take into account the port number.
      'Host' => "Host: $host",
      'User-Agent' => 'User-Agent: Drupal (+http://drupal.org/)',
      'Content-Length' => 'Content-Length: '. strlen($data)
    );

    // If the server url has a user then attempt to use basic authentication
    if (isset($uri['user'])) {
      $defaults['Authorization'] = 'Authorization: Basic '. base64_encode($uri['user'] . (!empty($uri['pass']) ? ":". $uri['pass'] : ''));
    }

    foreach ($headers as $header => $value) {
      $defaults[$header] = $header .': '. $value;
    }

    $request = $method .' '. $path ." HTTP/1.0\r\n";
    $request .= implode("\r\n", $defaults);
    $request .= "\r\n\r\n";
    $request .= $data;

    $result->request = $request;

    fwrite($fp, $request);

    // Fetch response.
    $response = '';
    while (!feof($fp) && $chunk = fread($fp, 1024)) {
      $response .= $chunk;
    }
    fclose($fp);

    // Parse response.
    list($split, $result->data) = explode("\r\n\r\n", $response, 2);
    $split = preg_split("/\r\n|\n|\r/", $split);

    list($protocol, $code, $text) = explode(' ', trim(array_shift($split)), 3);
    $result->headers = array();

    // Parse headers.
    while ($line = trim(array_shift($split))) {
      list($header, $value) = explode(':', $line, 2);
      if (isset($result->headers[$header]) && $header == 'Set-Cookie') {
        // RFC 2109: the Set-Cookie response header comprises the token Set-
        // Cookie:, followed by a comma-separated list of one or more cookies.
        $result->headers[$header] .= ','. trim($value);
      }
      else {
        $result->headers[$header] = trim($value);
      }
    }

    $responses = array(
      100 => 'Continue', 101 => 'Switching Protocols',
      200 => 'OK', 201 => 'Created', 202 => 'Accepted', 203 => 'Non-Authoritative Information', 204 => 'No Content', 205 => 'Reset Content', 206 => 'Partial Content',
      300 => 'Multiple Choices', 301 => 'Moved Permanently', 302 => 'Found', 303 => 'See Other', 304 => 'Not Modified', 305 => 'Use Proxy', 307 => 'Temporary Redirect',
      400 => 'Bad Request', 401 => 'Unauthorized', 402 => 'Payment Required', 403 => 'Forbidden', 404 => 'Not Found', 405 => 'Method Not Allowed', 406 => 'Not Acceptable', 407 => 'Proxy Authentication Required', 408 => 'Request Time-out', 409 => 'Conflict', 410 => 'Gone', 411 => 'Length Required', 412 => 'Precondition Failed', 413 => 'Request Entity Too Large', 414 => 'Request-URI Too Large', 415 => 'Unsupported Media Type', 416 => 'Requested range not satisfiable', 417 => 'Expectation Failed',
      500 => 'Internal Server Error', 501 => 'Not Implemented', 502 => 'Bad Gateway', 503 => 'Service Unavailable', 504 => 'Gateway Time-out', 505 => 'HTTP Version not supported'
    );
    // RFC 2616 states that all unknown HTTP codes must be treated the same as the
    // base code in their class.
    if (!isset($responses[$code])) {
      $code = floor($code / 100) * 100;
    }

    switch ($code) {
      case 200: // OK
      case 304: // Not modified
        break;
      case 301: // Moved permanently
      case 302: // Moved temporarily
      case 307: // Moved temporarily
        $location = $result->headers['Location'];

        if ($retry) {
          $result = $this->_httpRequest($result->headers['Location'], $headers, $method, $data, --$retry);
          $result->redirect_code = $result->code;
        }
        $result->redirect_url = $location;

        break;
      default:
        $result->error = $text;
    }

    $result->code = $code;
    $result->code_text = $responses[$code];
    return $result;
  }

  /**
   * Verifies that valid access parameters are attached to the product.
   */
  private function _isRenderRequestAllowed($product) {
    $accessInfo = $product->getAccessInfo();
    if (!empty($accessInfo)) {
      $expire_timestamp = $accessInfo->timestamp + $accessInfo->lifetime - $this->refreshFuzzSeconds;
      if (time() <= $expire_timestamp) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Handles setting up product access info and building render params.
   */
  private function _processAccessToken($params, $data) {
    $accessInfo = new stdClass();

    // Store the time the access params were obtained -- used to count
    // against the lifetime param to expire the object.
    $accessInfo->timestamp = time();
    // Extract the lifetime param, no need to pass this along to the
    // rendering server.
    $accessInfo->lifetime = (int) $data->lifetime;
    unset($data->lifetime);

    $accessInfo->renderAccessParameters = $data;

    $params->product->setAccessInfo($accessInfo);

    return $this->_buildRenderServerQueryParams($params);
  }

  /**
   * Sends a command to the API server.
   */
  private function _sendApiCommand($params, $retry) {
    $params = (object) $params;
    $url = $this->getApiServerUrl() . $params->command;
    $method = isset($params->method) ? strtoupper($params->method) : 'GET';

    $params->commandParameters->app_id = $this->getAppId();
    $params->commandParameters->api_key = $this->getApiKey();
    $params->commandParameters->api_version = $this->getApiVersion();

    // DEBUG.
    //echo "uuid: " . $params->commandParameters->request_id . ", command: " . $params->command;

    $data = NULL;
    $query = http_build_query($params->commandParameters);
    if ($method == 'GET') {
      $url .= '?' . $query;
    }
    else {
      $data = $query;
    }
    $result = $this->_httpRequest($url, array(), $method, $data);

    $return = new stdClass();

    if ($result->code == 200) {
      $json_result = $this->_extractResult($result->data);
      if ($json_result->result_num == 0) {
        $return->success = TRUE;
        $return->data = $this->_extractInfo($result->data);
      }
      else {
        $return->success = FALSE;
        $return->data = $json_result->result_text;
      }
      return $return;
    }
    else {
      if ($retry) {
        $retry--;
        return $this->_sendApiCommand($inParameters, $retry);
      }
      else {
        $return->success = FALSE;
        if (isset($result->error)) {
          $return->data = $result->error;
        }
        else {
          $return->data = $result->code_text;
        }
        return $return;
      }
    }
  }
}

