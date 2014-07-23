""" 

  PUBLIC METHODS:
 
  __init__(inParameters)
  clearRenderParameters()
  generateUrl(additionalParams)
  getAccessInfo()
  getRenderParameter(key)
  getWorkflowId()
  saveToFile(filepath,additionalParams)
  serve(additionalParams)
  setAccessInfo(accessInfo)
  setRenderParameter(key, newValue)
  setWorkflowId(newWorkflowId)
 
  PRIVATE METHODS:
 
  __setFinalParams(additionalParams)

"""

import copy
import requests

class PijazProduct(object):

  """ 
    Manages a renderable product.
  """

  # PUBLIC METHODS.

  def __init__(self, inParameters):
    """ 
      Inits the class.

      Args:
        inParameters: A dictionary with the following key/value pairs:
          serverManager: Required. An instance of the PijazServerManager class.
          workflowId: Required. The workflow ID for the product.
          renderParameters: Optional. A dictionary of render parameters to be included
            with every render request. They depend on the product, but these are
            typically supported params:
              message: Primary message to display.
              font: Font to use.
              halign: Horizontal justification (left, center, right, full).
              valign: Vertical justification (top, middle, bottom, full, even).
              quality: Image quality to produce (0-100).
    """
    params = inParameters
    self.accessInfo = None
    self.serverManager = params['serverManager']
    self.workflowId = params['workflowId']
    self.renderParameters = params.get('renderParameters', {})
    self.productPropertyDefaults = params.get('productPropertyDefaults', {})
    
  def clearRenderParameters(self):
    """ 
      Clear out all current render parameters.
     
      Any parameters currently stored with the product, including those passed
      when the product was instantiated, are cleared.
    """
    self.renderParameters = {}
  

  def generateUrl(self, additionalParams=None):
    """ 
      Build a fully formed URL which can be used to make a request for the
      product from a rendering server.
     
      Args:
        additionalParams: Optional. A dictionary of additional render parameters
        to be used for this request only.
     
      Returns:
        A fully formed URL that can be used in a render server HTTP request.
    """
    additionalParams = additionalParams or {}
    finalParams = self.__setFinalParams(additionalParams)
    options = {
      'product': self,
      'renderParameters': finalParams,
    }
    params = self.serverManager.buildRenderCommand(options)
    url = self.serverManager.buildRenderServerUrlRequest(params)
    return url

  def getAccessInfo(self):
    """ 
      Get the access info for a product.
     
      This method is required for products passed to the PijazServerManager
      class.
     
      Returns:
        The access info for the product.
    """
    return self.accessInfo
  
  def getRenderParameter(self, key):
    """ 
      Retrieve a render parameter.
     
      Args:
        key: The parameter name.
     
      Returns:
        The render parameter, or the default render parameter if none is set.
    """
    value = self.renderParameters.get(key, self.productPropertyDefaults.get(key, None))
    return value
  

  def getWorkflowId(self):
    """ 
      Get the workflow ID for the product.
     
      Returns:
        The workflow ID.
    """
    return self.workflowId
  
  def saveToFile(self, filepath, additionalParams=None):
    """ 
      Convenience method for saving a product directly to a file.
     
      This takes care of generating the render URL, making the request to the
      render server for the product, and saving to a file.
     
      Args:
        filepath: Required. The full file path.
        additionalParams: Optional. A dictionary of additional render parameters to be
        used for this request only.
     
      Returns:
        True on successful save of the file, False otherwise.
    """
    url = self.generateUrl(additionalParams)
    r = None
    try:
      r = requests.get(url)
    except:
      raise "Failed fetching image from %s" % url
    if r.status_code == 200:
      try:
        with open(filepath, 'wb') as f:
          f.write(r.content)
          f.close()
          return True
      except:
        raise "Failed writing file %s" % filepath
    return False
  
  def setAccessInfo(self, accessInfo=None):
    """ 
      Set the access info for the product.
     
      This method is required for products passed to the PijazServerManager
      class.
     
      Args:
        accessInfo: An accessInfo dictionary to store on the product.
    """
    self.accessInfo = accessInfo

  def setRenderParameter(self, key, newValue=None):
    """ 
      Set a render parameter on the product.
     
      Args:
        key: The parameter name.
        newValue: The parameter value.
     
      Optionally a dictionary of parameter key/value pairs can be passed as the
      first argument, and each pair will be added.
    """
    if type(key) is dict:
      for k in key:
        self.setRenderParameter(k, key[k])
    else:
      param = self.renderParameters.get(key, None)
      default = self.productPropertyDefaults.get(key, None)
      if param != newValue: 
        if newValue == None or newValue == default:
          del self.renderParameters[key]
        else:
          self.renderParameters[key] = newValue

  def setWorkflowId(self, newWorkflowId):
    """ 
      Set the workflow ID.
    """
    if self.workflowId != newWorkflowId:
      self.accessInfo = None
      self.workflowId = newWorkflowId

  # PRIVATE METHODS.

  def __setFinalParams(self, additionalParams=None):
    """ 
      Set the final render parameters for the product.
     
      Args:
        additionalParams: A dictionary of additional render parameters.
    """
    finalParams = copy.deepcopy(self.renderParameters)
    if additionalParams is not None:
      for key in additionalParams:
        finalParams[key] = additionalParams[key]
      
    
    finalParams['workflow'] = self.workflowId
    return finalParams

