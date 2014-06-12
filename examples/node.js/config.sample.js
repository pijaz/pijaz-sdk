/**
 * Pijaz client application settings.
 *
 * Visit http://developer.pijaz.com/#manage-apps to create and edit client
 * applications.
 */
// App ID.
exports.appId = '';
// API key.
exports.apiKey = '';


/**
 * Product settings.
 *
 * Visit http://developer.pijaz.com/#theme-designer to create and edit platform
 * products.
 */
// Workflow ID.
exports.workflowId = '';
// Workflow URL.
exports.workflowXmlUrl = '';
// Full local filepath for image file that the example code will create.
exports.filepath = '/tmp/hello-world-file.jpg';


/**
 * Local test server settings.
 *
 * The example app starts up a local HTTP server, adjust the settings here.
 */
// Server hostname.
exports.host = 'localhost';
// Server port.
exports.port = 8000;


/**
 * Pijaz Platform settings.
 *
 * Settings specifc to the Pijaz Synthesizer Platform, most often these should
 * not be edited.
 */
exports.pijaz = {};
// Fully qualified URL of the rendering server, include the trailing slash.
exports.pijaz.renderServer = 'http://render.pijaz.com/';
// Fully qualified URL of the API server, include the trailing slash.
exports.pijaz.apiServer = 'http://api.pijaz.com/';
