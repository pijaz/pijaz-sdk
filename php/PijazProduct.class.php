<?php

/**
 * Class: PijazProduct
 *
 * Manages a renderable product.
 *
 * inParameters: An object with the following key/value pairs.
 *
 *   serverManager: Required. An instance of the PijazServerManager class.
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
class PijazProduct {

  public $renderParameters;
  public $productPropertyDefaults;
  private $accessInfo;

  public function __construct($inParameters) {
    $params = (object) $inParameters;
    $this->serverManager = $params->serverManager;
    $this->workflowId = $params->workflowId;
    if (isset($params->renderParameters)) {
      $this->renderParameters = $params->renderParameters;
    }
    else {
      $this->renderParameters = new stdClass();
    }
    if (isset($params->productPropertyDefaults)) {
      $this->productPropertyDefaults = $params->productPropertyDefaults;
    }
    else {
      $this->productPropertyDefaults = new stdClass();
    }
  }

  /**
   * Method: getWorkflowId
   *
   * Return the workflow ID.
   */
  public function getWorkflowId() {
    return $this->workflowId;
  }


  /**
   * Method: setWorkflowId
   *
   * Set the workflow ID.
   */
  public function setWorkflowId($newWorkflowId) {
    if ($this->workflowId != $newWorkflowId ) {
      unset($this->accessInfo);
      $this->workflowId = $newWorkflowId;
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
  public function clearRenderParameters() {
    $this->renderParameters = new stdClass();
  }

  /**
   * Method: getAccessInfo (required by PijazServerManager).
   *
   * Return the access info for the product.
   */
  public function getAccessInfo() {
    return $this->accessInfo;
  }

  /**
   * Method: setAccessInfo (required by PijazServerManager).
   *
   * Set the access info for the product.
   */
  public function setAccessInfo($accessInfo = NULL) {
    if (!empty($accessInfo)) {
      $this->accessInfo = $accessInfo;
    }
    else {
      unset($this->accessInfo);
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
  public function setRenderParameter($key, $newValue = NULL) {
    if (is_object($key)) {
      foreach($key as $k => $v) {
        $this->setRenderParameter($k, $v);
      }
    }
    else {
      $param = isset($this->renderParameters->$key) ? $this->renderParameters->$key : NULL;
      $default = isset($this->productPropertyDefaults->$key) ? $this->productPropertyDefaults->$key : NULL;
      if ($param != $newValue) {
        if (is_null($newValue) || $newValue == $default) {
          unset($this->renderParameters->$key);
        }
        else {
          $this->renderParameters->$key = $newValue;
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
  public function getRenderParameter($key) {
    $value = $this->renderParameters->$key;
    if (!isset($value)) {
      $value = $this->productPropertyDefaults->$key;
    }
    return $value;
  }

  /**
   * Method: generateUrl
   *
   * Build a fully formed URL which can be used to make a request for the
   * product from a rendering server.
   *
   * Parameters:
   *   additionalParams: Optional. An object of additional render parameters
   *   to be used for this request only.
   *
   * Returns:
   *   A fully formed URL that can be used in a render server HTTP request.
   */
  public function generateUrl($additionalParams = NULL) {
    $additionalParams = empty($additionalParams) ? new stdClass() : $additionalParams;
    $finalParams = $this->setFinalParams($additionalParams);
    $options = new stdClass();
    $options->product = $this;
    $options->renderParameters = $finalParams;
    $params = $this->serverManager->buildRenderCommand($options);
    $url = $this->serverManager->buildRenderServerUrlRequest($params);
    return $url;
  }

  /**
   * Method: saveToFile
   *
   * Convenience method for saving a product directly to a file.
   *
   * This takes care of generating the render URL, making the request to the
   * render server for the product, and saving to a file.
   *
   * Note that fopen_wrappers must be enabled in the PHP configuration in
   * order for this method to work.
   * http://php.net/manual/en/filesystem.configuration.php#ini.allow-url-fopen
   *
   * Parameters:
   *   filepath: Required. The full file path.
   *   additionalParams: Optional. An object of additional render parameters to be
   *   used for this request only.
   *
   * Returns:
   *   TRUE on successful save of the file, FALSE otherwise.
   */
  public function saveToFile($filepath, $additionalParams = NULL) {
    $url = $this->generateUrl($additionalParams);
    if ($url) {
      $image_data = file_get_contents($url);
      if ($image_data !== FALSE) {
        $result = file_put_contents($filepath, $image_data);
        return $result !== FALSE;
      }
    }
    return FALSE;
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
   * Note that fopen_wrappers must be enabled in the PHP configuration in
   * order for this method to work.
   * http://php.net/manual/en/filesystem.configuration.php#ini.allow-url-fopen
   *
   * Parameters:
   *   additionalParams: Optional. An object of additional render parameters to be
   *   used for this request only.
   *
   * Returns:
   *   TRUE on successful save of the file, FALSE otherwise.
   */
  public function serve($additionalParams = NULL) {
    $url = $this->generateUrl($additionalParams);
    if ($url) {
      $image = imagecreatefromjpeg($url);
      if ($image) {
        // Set the content type header.
        // TODO: in the future this should be configurable from attributes.
        header('Content-type: image/jpeg');
        // Output the image
        imagejpeg($image);
        // Free up memory
        imagedestroy($image);
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Method: setFinalParams
   *
   * Set the final render parameters for the product.
   *
   * Parameters:
   *   additionalParams: An object of additional render parameters.
   */
  public function setFinalParams($additionalParams = NULL) {
    $finalParams = clone $this->renderParameters;
    if (is_object($additionalParams)) {
      foreach ($additionalParams as $key => $value) {
        $finalParams->$key = $value;
      }
    }
    $finalParams->workflow = $this->workflowId;
    return $finalParams;
  }
}

