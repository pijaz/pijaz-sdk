--[[
  Pijaz client application settings.

  Visit http://developer.pijaz.com/#manage-apps to create and edit client
  applications.
]]
-- App ID.
local APP_ID = ''
-- API key.
local API_KEY = ''


--[[
  Product settings.

  Visit http://developer.pijaz.com/#theme-designer to create and edit platform
  products.
]]
-- Workflow ID.
local WORKFLOW_ID = ''
-- Workflow URL.
local WORKFLOW_XML_URL = ''
-- Full local filepath for image file that the example code will create.
local IMAGE_FILEPATH = '/tmp/hello-world-file.jpg'


--[[
  Pijaz Platform settings.

  Settings specifc to the Pijaz Synthesizer Platform, most often these should
  not be edited.
]]
-- Fully qualified URL of the rendering server, include the trailing slash.
local RENDER_SERVER_URL = 'http://render.pijaz.com/'
-- Fully qualified URL of the API server, include the trailing slash.
local API_SERVER_URL = 'http://api.pijaz.com/'

return {
  APP_ID = APP_ID,
  API_KEY = API_KEY,
  WORKFLOW_ID = WORKFLOW_ID,
  WORKFLOW_XML_URL = WORKFLOW_XML_URL,
  IMAGE_FILEPATH = IMAGE_FILEPATH,
  RENDER_SERVER_URL = RENDER_SERVER_URL,
  API_SERVER_URL = API_SERVER_URL,
}
