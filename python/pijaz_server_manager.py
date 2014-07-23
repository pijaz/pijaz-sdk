""" 

  PUBLIC METHODS:
 
  __init__(inParameters)
  buildRenderCommand(inParameters)
  buildRenderServerUrlRequest(inParamaters)
  getApiKey()
  getApiServerUrl()
  getApiVersion()
  getAppId()
  getRenderServerUrl()
  sendApiCommand(inParameters)
 
  PRIVATE METHODS:
 
  __buildRenderServerQueryParams(params)
  __extractInfo(data)
  __extractResult(data)
  __httpRequest(url, headers, method, data, retry)
  __isRenderRequestAllowed(product)
  __processAccessToken(params, data)
  __sendApiCommand(params, retry)

"""

import copy
import json
import requests
import time
import urllib

class PijazServerManager(object):
  """ 
    Server manager class, used for making calls to a Pijaz API service and/or
    rendering service.
  """

  PIJAZ_API_VERSION = "1"
  PIJAZ_API_SERVER = "http://api.pijaz.com/"
  PIJAZ_RENDER_SERVER = "http://render.pijaz.com/"
  SERVER_REQUEST_ATTEMPTS = 2
  REFRESH_FUZZ_SECONDS = 10

  # PUBLIC METHODS.

  def __init__(self, inParameters):
    """
      Inits a ServerManager object.
     
      Args:
     
        inParameters: A dictionary with the following key/value pairs.
          appId: Required. The ID of the client application.
          apiKey: Required. The API key associated with the client. This key should
            be kept confidential, and is used to allow the associated client to
            access the API server.
          renderServer: Optional. The base URL of the rendering service. Include
            the trailing slash. Default: http://render.pijaz.com/
          apiServer: Optional. The base URL of the API service. Include
            the trailing slash. Default: http://api.pijaz.com/
          refreshFuzzSeconds: Optional. Number of seconds to shave off the lifetime
            of a rendering access token, this allows a smooth re-request for a new
            set of access params. Default: 10
          apiVersion: Optional. The API version to use. Currently, only version 1
            is supported. Default: 1
    """
    params = inParameters
    self.appId = params['appId']
    self.apiKey = params['apiKey']
    self.apiServer = params.get('apiServer', self.PIJAZ_API_SERVER)
    self.renderServer = params.get('renderServer', self.PIJAZ_RENDER_SERVER)
    self.refreshFuzzSeconds = params.get('refreshFuzzSeconds', self.REFRESH_FUZZ_SECONDS)
    self.apiVersion = params.get('apiVersion', self.PIJAZ_API_VERSION)

  def buildRenderCommand(self, inParameters):
    """ 
      Build the set of query parameters for a render request.
     
      Args:
        inParameters: A dictionary with the following key/value pairs:
          product: An instance of the PijazProduct class.
          renderParameters: A dictionary of all params sent to the render request.
     
      Returns:
        If successful, a dictionary of query parameters to pass to the rendering
        server. These can be converted into a full URL by calling
        buildRenderServerUrlRequest(params).
    """
    params = inParameters
    if self.__isRenderRequestAllowed(params['product']):
      return self.__buildRenderServerQueryParams(params)
    else:
      commandParameters = {
        'workflow': params['renderParameters']['workflow'],
      }
      if 'xml' in params['renderParameters']:
        commandParameters['xml'] = params['renderParameters']['xml']
      
      options = {
        'command': 'get-token',
        'commandParameters': commandParameters,
      }
      result = self.sendApiCommand(options)
      if result['success']: 
        return self.__processAccessToken(params, result['data'])

  def buildRenderServerUrlRequest(self, inParameters):
    """ 
      Builds a fully qualified render request URL.
     
      Args:
        inParameters: A dictionary of query parameters for the render request.
     
      Returns:
        The constructed URL.
    """
    url = self.getRenderServerUrl() + "render-image?" + urllib.urlencode(inParameters)
    return url

  def getApiKey(self):
    """ 
      Get the API key of the client application.
     
      Returns:
        The client API key.
    """
    return self.apiKey

  def getApiServerUrl(self):
    """ 
      Get current API server URL.
     
      Returns:
        The API server URL.
    """
    return self.apiServer

  def getApiVersion(self):
    """ 
      Get the API version the server manager is using.
     
      Returns:
        The API version.
    """
    return self.apiVersion

  def getAppId(self):
    """ 
      Get the client application ID.
     
      Returns:
        The application ID.
    """
    return self.appId

  def getRenderServerUrl(self):
    """ 
      Get current render server URL.
     
      Returns:
        The render server URL.
    """
    return self.renderServer
  

  """ 
    Send a command to the API server.
   
    Args:
      inParameters: A dictionary with the following key/value pairs.
        command: Required. The command to send to the API server. One of the
          following:
            get-token: Retrieve a rendering access token for a workflow.
              commandParameters:
                workflow: The workflow ID.
        commandParameters: Optional. A dictionary of parameters. See individual
          command for more information
        method: Optional. The HTTP request type. Default: GET
   
    Returns:
      A dictionary with the following key/value pairs
        success: True if the request succeed, False otherwise.
        data: If the request was successful, a dictionary containing the
        response data, if not, a string containing the error message.
    """
  def sendApiCommand(self, inParameters):
    return self.__sendApiCommand(inParameters, self.SERVER_REQUEST_ATTEMPTS - 1)

  # PRIVATE METHODS.

  def __buildRenderServerQueryParams(self, params):
    """ 
      Construct a URL with all user supplied and constructed parameters
    """
    accessInfo = params['product'].getAccessInfo()
    queryParams = copy.deepcopy(accessInfo['renderAccessParameters'])
    if 'renderParameters' in params: 
      for key in params['renderParameters']:
        queryParams[key] = params['renderParameters'][key]
    return queryParams
  

  def __extractInfo(self, data):
    """ 
      Extract the information from a server JSON response.
    """
    try:
      jsonData = json.loads(data)
      if jsonData['result']['result_num'] == 0: 
        return jsonData['info']
    except:
      raise "Error parsing JSON response from server: %s" % data
    return False
  
  def __extractResult(self, data):
    """ 
      Extract the result from a server JSON response.
    """
    try:
      jsonData = json.loads(data)
      return jsonData['result']
    except:
      raise "Error parsing JSON response from server: %s" % data
    return False

  def __httpRequest(self, url, method='GET', data=None):
    """
    Perform an HTTP request.

      Args:
        url:
          A string containing a fully qualified URI.
        method:
          Optional. A string defining the HTTP request method to use. Only GET
          and POST are supported.
        data:
          Optional. A dictionary containing data to include in the request.
      Returns:
        A dictionary with the following key/value pairs:
          statusCode: The response status code.
          data: The response data.
    """
    method = method.upper()
    data = data or {}

    response = {}
    try:
      r = None
      if method == 'GET':
        r = requests.get(url, params=data)
      elif method == 'POST':
        r = requests.post(url, data=data)
      response['statusCode'] = r.status_code
      response['data'] = r.content
    except:
      raise "HTTP request error, method: %s, url: %s, data: %s" % (method, url, data)
    return response

  def __isRenderRequestAllowed(self, product):
    """ 
      Verifies that valid access parameters are attached to the product.
    """
    accessInfo = product.getAccessInfo()
    if accessInfo:
      expire_timestamp = accessInfo['timestamp'] + accessInfo['lifetime'] - self.refreshFuzzSeconds
      if time <= expire_timestamp:
        return True
    return False

  def __processAccessToken(self, params, data):
    """ 
      Handles setting up product access info and building render params.
    """
    accessInfo = {}

    # Store the time the access params were obtained -- used to count
    # against the lifetime param to expire the dictionary.
    accessInfo['timestamp'] = int(time.time())
    # Extract the lifetime param, no need to pass this along to the
    # rendering server.
    accessInfo['lifetime'] = int(data['lifetime'])
    del data['lifetime']

    accessInfo['renderAccessParameters'] = data

    params['product'].setAccessInfo(accessInfo)

    return self.__buildRenderServerQueryParams(params)
  

  def __sendApiCommand(self, params, retry):
    """ 
      Sends a command to the API server.
    """
    origParams = copy.deepcopy(params)
    url = self.getApiServerUrl() + params['command']
    method = 'GET'
    try:
      method = params['method'].upper()
    except KeyError:
      pass

    params['commandParameters']['app_id'] = self.getAppId()
    params['commandParameters']['api_key'] = self.getApiKey()
    params['commandParameters']['api_version'] = self.getApiVersion()

    # DEBUG.
    #print "uuid: " + params['commandParameters']['request_id'] + ", command: " + params['command']

    result = None
    try:
      result = self.__httpRequest(url, method, params['commandParameters'])
    except:
      if retry > 0: 
        retry = retry -1
        return self.__sendApiCommand(origParams, retry)
      else:
        raise "Error sending API command, path: %s, params: %s" % (url, params['commandParameters'])
    returnVal = {}
    if result['statusCode'] == 200: 
      jsonResult = self.__extractResult(result['data'])
      if jsonResult['result_num'] == 0: 
        returnVal['success'] = True
        returnVal['data'] = self.__extractInfo(result['data'])
      else:
        returnVal['success'] = False
        returnVal['data'] = jsonResult['result_text']
    else:
      returnVal['success'] = False
      returnVal['data'] = result['data']
    return returnVal

