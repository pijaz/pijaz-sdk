--[[
  This example illustrates how to generate a render URL and save a product
  to a file from the command line.
]]

local config = require "config"
local Pijaz = require "pijaz"

-- Set up the server class.
local serverOptions = {}
serverOptions.appId = config.APP_ID
serverOptions.apiKey = config.API_KEY
serverOptions.apiServer = config.API_SERVER_URL
serverOptions.renderServer = config.RENDER_SERVER_URL
local server = Pijaz.ServerManager(serverOptions)

-- Set up the product class.
local productOptions = {}
productOptions.serverManager = server
productOptions.workflowId = config.WORKFLOW_ID
productOptions.renderParameters = {}
productOptions.renderParameters.xml = config.WORKFLOW_XML_URL
local product = Pijaz.Product(productOptions)

-- Other render parameters declared in the product's XML can also be supplied,
-- if they are not, then default values will be used. Passing them as an
-- argument to generateUrl means these parameters will only be used for this
-- generation request.
local productOptions = {}
productOptions.message = 'world'
productOptions.color = 'black'
local url = product:generateUrl(productOptions)
local message
if url then
  message = "URL: " .. url
else
  message = "URL generation error"
end
print("\n" .. message .. "\n")


-- The saveToFile method provides a convenient way to save a product to a file.
local fileProductOptions = {}
fileProductOptions.message = 'world file'
fileProductOptions.color = 'yellow'
local result = product:saveToFile(config.IMAGE_FILEPATH, fileProductOptions)
local message
if result then
  message = "Product file saved to: " .. config.IMAGE_FILEPATH
else
  message = "Product file save error"
end
print("\n" .. message .. "\n")

