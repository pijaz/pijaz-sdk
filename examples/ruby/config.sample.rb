module ExampleConfig

=begin
  Pijaz client application settings.

  Visit http://developer.pijaz.com/#manage-apps to create and edit client
  applications.
=end
  # App ID.
  APP_ID = ''
  # API key.
  API_KEY = ''


=begin
  Product settings.

  Visit http://developer.pijaz.com/#theme-designer to create and edit platform
  products.
=end
  # Workflow ID.
  WORKFLOW_ID = ''
  # Workflow URL.
  WORKFLOW_XML_URL = ''
  # Full filepath for image file that the example code will create.
  IMAGE_FILEPATH = '/tmp/hello-world-file.jpg'


=begin
  Pijaz Platform settings.

  Settings specifc to the Pijaz Synthesizer Platform, most often these should
  not be edited.
=end
  # Fully qualified URL of the rendering server, include the trailing slash.
  RENDER_SERVER_URL = 'http://render.pijaz.com/'
  # Fully qualified URL of the API server, include the trailing slash.
  API_SERVER_URL = 'http://api.pijaz.com/'

end

