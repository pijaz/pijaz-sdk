"""
  This example illustrates how to generate a render URL and save a product
  to a file from the command line.
"""

import config
import pijaz_server_manager
import pijaz_product

# Set up the server class.
serverOptions = {
 'appId': config.APP_ID,
 'apiKey': config.API_KEY,
 'apiServer': config.API_SERVER_URL,
 'renderServer': config.RENDER_SERVER_URL,
}
server = pijaz_server_manager.PijazServerManager(serverOptions)

# Set up the product class.
productOptions = {
  'serverManager': server,
  'workflowId': config.WORKFLOW_ID,
}
product = pijaz_product.PijazProduct(productOptions)

# Any user-generated product must include the 'xml' render parameter, which
# is the fully qualified URL to the XML file used to generate the product.
# Using setRenderParameter() ensures it will be included in all product
# generation requests.
renderParameterOptions = {
  'xml': config.WORKFLOW_XML_URL,
}
product.setRenderParameter(renderParameterOptions)

# Other render parameters declared in the product's XML can also be supplied,
# if they are not, then default values will be used. Passing them as an
# argument to generateUrl means these parameters will only be used for this
# generation request.
productOptions = {
  'message': 'world',
  'color': 'black',
}
url = product.generateUrl(productOptions)
message = ''
if url:
  message = "URL: " + url
else:
  message = "URL generation error"
print "\n" + message + "\n";


# The saveToFile method provides a convenient way to save a product to a file.
fileProductOptions = {
  'message': 'world file',
  'color': 'yellow',
}
result = product.saveToFile(config.IMAGE_FILEPATH, fileProductOptions);
message = ''
if result:
  message = "Product file saved to: " + config.IMAGE_FILEPATH
else:
  message = "Product file save error"
print "\n" + message + "\n";

