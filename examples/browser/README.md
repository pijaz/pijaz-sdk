Browser example application
===========================

This example application showcases the basics of using the Pijaz SDK in a browser.


### Initial platform setup

None required, the browser talks to the Pijaz servers directly.

**Important:** Since there is no way to securely pass an API key in the browser, only publicly accessible themes should be used.

### API

The browser libraries have a completely different API than the server-side libraries, see the inline documentation in the library files or the js/example.js file for usage.

### Application configuration

* Copy all files from the library's js/ directory to the example's js/ directory.
* Download jquery (renamed to jquery.js) and underscore (renamed to underscore.js) into the example's js/ directory.
* Copy js/config.sample.js to js/config.js


### Running the application

* Visit example.html in your browser.

You should see a simple display of a theme, with a theme selector and a message box.

