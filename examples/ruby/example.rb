=begin
  This example illustrates how to generate a render URL and save a product
  to a file from the command line.
=end

require "rubygems"
require "pijaz-sdk"
require_relative "config"


# Set up the server class.
serverOptions = {}
serverOptions['appId'] = ExampleConfig::APP_ID
serverOptions['apiKey'] = ExampleConfig::API_KEY
serverOptions['apiServer'] = ExampleConfig::API_SERVER_URL
serverOptions['renderServer'] = ExampleConfig::RENDER_SERVER_URL
server = Pijaz::SDK::ServerManager.new(serverOptions)

# Set up the product class.
productOptions = {}
productOptions['serverManager'] = server
productOptions['workflowId'] = ExampleConfig::WORKFLOW_ID
productOptions['renderParameters'] = {}
productOptions['renderParameters']['xml'] = ExampleConfig::WORKFLOW_XML_URL
product = Pijaz::SDK::Product.new(productOptions)

# Other render parameters declared in the product's XML can also be supplied,
# if they are not, then default values will be used. Passing them as an
# argument to generateUrl means these parameters will only be used for this
# generation request.
productOptions = {}
productOptions['message'] = 'world'
productOptions['color'] = 'black'
url = product.generateUrl(productOptions)
message = ''
if url
  message = "URL: " + url
else
  message = "URL generation error"
end
puts("\n" + message + "\n")


# The saveToFile method provides a convenient way to save a product to a file.
fileProductOptions = {}
fileProductOptions['message'] = 'world file'
fileProductOptions['color'] = 'yellow'
result = product.saveToFile(ExampleConfig::IMAGE_FILEPATH, fileProductOptions)
message = ''
if result
  message = "Product file saved to: " + ExampleConfig::IMAGE_FILEPATH
else
  message = "Product file save error"
end
puts("\n" + message + "\n")

