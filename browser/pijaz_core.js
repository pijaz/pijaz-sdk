/*****************************************************************************
 ** File: Pijaz.js
 ** By:   Michael Hoffman
 **
 ** Helper classes for retrieving pijaz synthesized products, managing them
 ** and providing UX's for interacting with them.
 **
 ** Copyright (c) 2011-2014, pijaz, inc.
 ****************************************************************************/

// How long until we give up on the server.
var SERVER_TIMEOUT = 5;
// How many times to try a specific request before failing.
var SERVER_REQUEST_ATTEMPTS = 2;



/**********************************************
 * Class PijazUtil
 *
 * Various utility functions.
 **********************************************/

var PijazUtil = IClass.extend({
    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     * @param obj1
     * @param obj2
     * @returns obj3 a new object based on obj1 and obj2
     */

    merge: function(obj1, obj2) {
        var obj3 = {};
        for (attrname in obj1) {
            if (typeof obj1[attrname] != "undefined") {
                obj3[attrname] = obj1[attrname];
            }
        }
        for (attrname in obj2) {
            if (typeof obj2[attrname] != "undefined") {
                obj3[attrname] = obj2[attrname];
            }
        }
        return obj3;
    },


    getWindowSize: function() {
        var winW = 630,
            winH = 460;

        if (document.body && document.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }

        if (document.compatMode == 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
            winW = document.documentElement.offsetWidth;
            winH = document.documentElement.offsetHeight;
        }

        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }

        return {
            w: winW,
            h: winH
        };
    },

    fitToArea: function(sizeOfArea, sizeToFit, maxRatio) {
        var vRatio;
        var hRatio;
        var ratio;

        if ( typeof maxRatio == 'undefined' )  maxRatio = 1.0;

        hRatio = sizeOfArea.w / sizeToFit.w;
        vRatio = sizeOfArea.h / sizeToFit.h;

        if (hRatio < vRatio) {
            ratio = hRatio;
        } else {
            ratio = vRatio;
        }

        if ( ratio > maxRatio )  ratio = maxRatio;

        return {
            x: Math.round((sizeOfArea.w - sizeToFit.w * ratio) / 2),
            y: Math.round((sizeOfArea.h - sizeToFit.h * ratio) / 2),
            w: Math.round(sizeToFit.w * ratio),
            h: Math.round(sizeToFit.h * ratio),
            ratio: ratio,
        };
    },



    fillToArea: function(sizeOfArea, sizeToFit, maxRatio) {
        var vRatio;
        var hRatio;
        var ratio;

        if ( typeof maxRatio == 'undefined' )  maxRatio = 1.0;

        hRatio = sizeOfArea.w / sizeToFit.w;
        vRatio = sizeOfArea.h / sizeToFit.h;

        if (hRatio > vRatio) {
            ratio = hRatio;
        } else {
            ratio = vRatio;
        }

        if ( ratio > maxRatio )  ratio = maxRatio;

        return {
            x: Math.round((sizeOfArea.w - sizeToFit.w * ratio) / 2),
            y: Math.round((sizeOfArea.h - sizeToFit.h * ratio) / 2),
            w: Math.round(sizeToFit.w * ratio),
            h: Math.round(sizeToFit.h * ratio),
            ratio: ratio,
        };
    },


    // Return a randomly generated v4 UUID, per RFC 4122
    uuid: function() {
        var w1 = this.randomInt();
        var w2 = this.randomInt();
        var w3 = this.randomInt();
        var w4 = this.randomInt();
        var version = 4;

        var uuid = new Array(36);
        var data = [
            (w1 & 0xFFFFFFFF),
            (w2 & 0xFFFF0FFF) | ((version || 4) << 12), // version (1-5)
            (w3 & 0x3FFFFFFF) | 0x80000000,    // rfc 4122 variant
            (w4 & 0xFFFFFFFF)
        ];
        for (var i = 0, k = 0; i < 4; i++) {
            var rnd = data[i];
            for (var j = 0; j < 8; j++) {
                if (k == 8 || k == 13 || k == 18 || k == 23) {
                    uuid[k++] = '-';
                }
                var r = (rnd >>> 28) & 0xf; // Take the high-order nybble
                rnd = (rnd & 0x0FFFFFFF) << 4;
                uuid[k++] = this.hex.charAt(r);
            }
        }
        return uuid.join('');
    },

    hex: '0123456789abcdef',

    randomReal: function( beg, end ) {
        beg = parseFloat(beg);
        end = parseFloat(end);

        var r = Math.random();

        return beg + (r % (end-beg));
    },

    // Return a random integer in [0, 2^32).
    randomInt: function( beg, end ) {
        if ( typeof beg == 'undefined' ) {
            beg = 0;
            end = 0x7fffffff;
        } else if ( typeof end == 'undefined' ) {
            end = beg;
            beg = 0;
        }

        return beg + Math.floor((end-beg) * Math.random());
    },

    /*
     * Returns the current Unix time
     */

    currentTimestamp: function() {
        var dateobj = new Date;
        var timestamp = parseInt(dateobj.getTime() / 1000);
        return timestamp;
    },


    /**
      * Retrieve the coordinates of the given event relative to the center
      * of the widget.
      *
      * @param event
      *   A mouse-related DOM event.
      * @param reference
      *   A DOM element whose position we want to transform the mouse coordinates to.
      * @return
      *    A hash containing keys 'x' and 'y'.
      */

     getRelativePosition : function(event, reference) {
       var x, y;
       event = event || window.event;
       var el = event.target || event.srcElement;

       if (!window.opera && (typeof event.touches != 'undefined' || typeof event.offsetX != 'undefined')) {
         // Use offset coordinates and find common offsetParent
         var pos;

         if ( typeof event.touches != 'undefined' && event.touches.length ) {
             pos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
             el = event.touches[0].target;
         } else {
             pos = { x: event.offsetX, y: event.offsetY };
         }

         // Send the coordinates upwards through the offsetParent chain.
         var e = el;
         while (e) {
           e.mouseX = pos.x;
           e.mouseY = pos.y;
           pos.x += e.offsetLeft;
           pos.y += e.offsetTop;
           e = e.offsetParent;
         }

         // Look for the coordinates starting from the reference element.
         var e = reference;
         var offset = { x: 0, y: 0 }
         while (e) {
           if (typeof e.mouseX != 'undefined') {
             x = e.mouseX - offset.x;
             y = e.mouseY - offset.y;
             break;
           }
           offset.x += e.offsetLeft;
           offset.y += e.offsetTop;
           e = e.offsetParent;
         }

         // Reset stored coordinates
         e = el;
         while (e) {
           e.mouseX = undefined;
           e.mouseY = undefined;
           e = e.offsetParent;
         }
       }
       else {
         // Use absolute coordinates
         var pos = this.getAbsolutePosition(reference);
         x = event.pageX  - pos.x;
         y = event.pageY - pos.y;
       }
       return { x: x, y: y };
     },

     getAbsolutePosition : function(element) {
         var r = { x: element.offsetLeft, y: element.offsetTop };
         if (element.offsetParent) {
           var tmp = this.getAbsolutePosition(element.offsetParent);
           r.x += tmp.x;
           r.y += tmp.y;
         }
         return r;
    },


    disableSelection : function( target ){

       if (typeof target.onselectstart!="undefined") { //IE route
           target.onselectstart=function(){return false;}

       } else if (typeof target.style != "undefined" && typeof target.style.MozUserSelect!="undefined") { //Firefox route
           target.style.MozUserSelect="none";

       } else { //All other route (ie: Opera)
           target.onmousedown=function(){return false;}
       }

       if (typeof target.style != "undefined" ) {
           target.style.cursor = "default";
       }
   },


   setCookie: function(name, value, daysToExpire) {
       var expireDate = new Date()
       var deltaTime = expireDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000)
       expireDate.setTime(deltaTime)

       var fullValue = escape(value) + ((typeof daysToExpire == 'undefined') ? "" : "; expires=" + expireDate.toUTCString());
       document.cookie = name + "=" + fullValue;
   },

   getCookie: function(nameToFind) {
       var i, name, value;

       var cookies = document.cookie.split(";");
       for (i=0; i<cookies.length; i++) {
           value = cookies[i].substr(cookies[i].indexOf("=")+1);
           name = cookies[i].substr(0, cookies[i].indexOf("="));
           name = name.replace(/^\s+|\s+$/g,"");
           if (name == nameToFind) {
               return unescape( value );
           }
       }
       return null;
   },

    isEventSupported: function(eventName) {
      var TAGNAMES = {
        'select':'input',
        'change':'input',
        'submit':'form',
        'reset':'form',
        'error':'img',
        'load':'img',
        'abort':'img',
      }
      var el = document.createElement(TAGNAMES[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
});




var PijazServerManager = IClass.extend({

    init: function(inParameters) {
		var defaultRenderServer, defaultApiServer;

        this.apiVersion = 1;

		if ( typeof gDefaultRenderServer == 'undefined' )
			defaultRenderServer = 'http://render.pijaz.com/';
		else
			defaultRenderServer = gDefaultRenderServer;

		if ( typeof gDefaultApiServer == 'undefined' )
			defaultApiServer = 'http://api.pijaz.com/';
		else
			defaultApiServer = gDefaultApiServer

		var defaultParameters = {
            renderServer: defaultRenderServer,
            apiServer: defaultApiServer,
            errorNode: jQuery("#pijaz-debug"),              // MTH DEBUG
            appId: 0,
            refreshFuzzSeconds: 10,
            apiVersion: this.apiVersion,
            server_timeout: SERVER_TIMEOUT
        }

        this.utils = new PijazUtil();

        this.parameters = this.utils.merge(defaultParameters, inParameters);

        this.requests = {};
    },

    /*****************************************************************************
     ** Method: getApiVersion
     **
     ** Get the API version the server manager is using.
     *****************************************************************************/
    getApiVersion: function() {
        return this.parameters.apiVersion;
    },


    /*****************************************************************************
     ** Method: getRenderServerUrl
     **
     ** Get current render server URL
     *****************************************************************************/
    getRenderServerUrl: function() {
        return this.parameters.renderServer;
    },

    /*****************************************************************************
     ** Method: getApiServerUrl
     **
     ** Get current api server URL
     *****************************************************************************/
    getApiServerUrl: function() {
        return this.parameters.apiServer;
    },

    /*****************************************************************************
     ** Method: getAppId
     **
     ** Get the application ID of owning web application
     *****************************************************************************/
    getAppId: function() {
        return this.parameters.appId;
    },

    /*****************************************************************************
     ** Method: sendApiCommand
     **
     ** Send a command to the API server and delegate response.
     **
     ** inParameters:
     **
     ** command             REQUIRED        get_token           Parameters: app_id, workflow
     **                                     login               Parameters: user_name, password
     **                                     register              Parameters: user_name, first_name, last_name, email, password_1, password_2
     **                                     graph/me
     **                                     graph/products
     **                                     graph/products/detail
     **                                     graph/product/<pid>
     **                                     graph/categories
     **                                     graph/categories/detail
     **                                     graph/categories/<cid>
     **                                     graph/categories/<cid>/products
     **                                     graph/categories/<cid>/products/detail
     **
     ** commandParameters   optional        See individual command for more information
     ** successProc         optional        function to invoke upon successful execution
     ** failProc            optional        function to invoke upon failed command execution
     *
     *****************************************************************************/

    sendApiCommand: function(inParameters) {
        var url = this.parameters.apiServer + inParameters.command;
        var type = _.isUndefined(inParameters.type) ? 'GET' : inParameters.type;

        inParameters.commandParameters.app_id = this.parameters.appId;
        inParameters.commandParameters.api_version = this.getApiVersion();

        // If an existing request handler was already created, use it,
        // otherwise make one.
        var handler_object;
        if (_.isUndefined(inParameters.commandParameters.request_id)) {
            handler_object = {
                'api_server_requests': 1,
            }
            inParameters.commandParameters.request_id = this.createRequestHandler(handler_object);
        }
        else {
            handler_object = this.retrieveRequestHandlerById(inParameters.commandParameters.request_id);
            // If api_server_requests is already populated, it's a retry.
            if (_.isUndefined(handler_object.api_server_requests)) {
              this.addRequestHandlerProperty(handler_object, 'api_server_requests', 1);
            }
        }

        // DEBUG.
        //console.log("uuid: " + inParameters.commandParameters.request_id + ", command: " + inParameters.command);

        var apiCommandSuccess = _.bind( this._apiCommandSuccess, this, inParameters);
        var apiCommandFailure = _.bind( this._apiCommandFailure, this, inParameters);
        jQuery.ajax(url, {
          type: type,
          dataType: "jsonp",
          data: inParameters.commandParameters,
          success: apiCommandSuccess,
          failure: apiCommandFailure,
          jsonp: "_jsonp_callback",
          timeout: this.parameters.serverTimeout
        });
    },

    _apiCommandSuccess: function(inParameters, json) {
        var handler_object = this.retrieveRequestHandler(json);
        this.removeRequestHandlerProperty(handler_object, 'api_server_requests');
        inParameters.successProc(json);
    },

    _apiCommandFailure: function(inParameters, json) {
        var failProc;
        if (_.isFunction(inParameters.failProc)) {
           failProc = inParameters.failProc;
        } else if (this.parameters.errorNode != null && !_.isUndefined(this.parameters.errorNode.html())) {
           failProc = _.bind( this._showErrorOnFail, this);
        }
        var handler_object = this.retrieveRequestHandlerById(inParameters.commandParameters.request_id);
        if (handler_object) {
           if (handler_object.api_server_requests && handler_object.api_server_requests < SERVER_REQUEST_ATTEMPTS) {
               this.addRequestHandlerProperty(handler_object, 'api_server_requests', handler_object.api_server_requests + 1);
               this.sendApiCommand(inParameters);
           }
           else {
               this.removeRequestHandlerProperty(handler_object, 'api_server_requests');
               if (failProc) {
                   failProc(json);
               }
           }
        }
        else if (failProc) {
           failProc(json);
        }
    },

    /*****************************************************************************
     * Method:  buildRenderCommand
     *
     * Manage access control for a render command, and if access can be established
     * construct a full formed render command to the render server and delegate this
     * url to the caller's success or fail delegate procs.
     *
     * inParameters:
     *
     *		product				product object
     *                          (must provide getAccessInfo() and setAccessInfo() methods to store opaque access info )
     *		renderParameters	all params sent to render request
     *		successProc			what to do after success
     *		failProc			what to do after fail
     *
     * Success proc receives an object of query parameters to pass to the
     * rendering server.  These can be converted into a full URL by calling
     * buildRenderServerUrlRequest(params).
     ****************************************************************************/

    buildRenderCommand: function(inParameters) {
        if (this._isRenderRequestAllowed(inParameters.product)) {
            inParameters.successProc(this._buildRenderServerQueryParams(inParameters));
        } else {
            var processGetTokenProc = _.bind( this._processGetTokenProc, this, inParameters);
            var commandParameters = { workflow: inParameters.renderParameters.workflow }
            if ( inParameters.renderParameters.xml ) {
              commandParameters.xml = inParameters.renderParameters.xml;
            }
            this.sendApiCommand({
                command: "get-token",
                commandParameters: commandParameters,
                successProc: processGetTokenProc,
                failProc: inParameters.failProc
            });
        }
    },

    /*****************************************************************************
     * Method:  executeRenderCommand
     *
     * Send a command to the render server and hand off returned json for processing
     * by the caller's successProc
     *
     * inParameters:
     *
     *		commandParameters	all params sent to render request
     *		successProc			what to do after success
     *		failProc			what to do after fail
     *
     * Success proc receives the json result.
     ****************************************************************************/

    executeRenderCommand: function(inParameters) {
        var failProc;

        if ( typeof inParameters.commandParameters == 'undefined' )
            inParameters.commandParameters = { command : 'version' };

        inParameters.commandParameters.app_id = this.parameters.appId;
        inParameters.commandParameters.api_version = this.getApiVersion();

        var url = this.parameters.renderServer + "execute-command";
        var successProc = _.bind( this._executeRenderCommandSuccessProc, this, inParameters);
        var failProc = _.bind( this._executeRenderCommandFailProc, this, inParameters);

        jQuery.ajax({
          type: 'GET',
          dataType: "jsonp",
          url: url,
          data: inParameters.commandParameters,
          success: successProc,
          failure: failProc,
          jsonp: "_jsonp_callback",
          timeout: this.parameters.serverTimeout
        });

    },

    _executeRenderCommandSuccessProc: function( inParameters, json ) {
        if (_.isFunction(inParameters.successProc)) {
            inParameters.successProc( inParameters, json );
        }
    },

    _executeRenderCommandFailProc: function( inParameters, json ) {
        var failProc;
        if (_.isFunction(inParameters.failProc)) {
           failProc = inParameters.failProc;
        } else if (this.parameters.errorNode != null && !_.isUndefined(this.parameters.errorNode.html())) {
           failProc = _.bind( this._showErrorOnFail, this);
        }
        if (failProc) {
            failProc( inParameters, json );
        }
    },

    _showErrorOnFail: function(json) {
        this.parameters.errorNode.html("Could not get access to api server");
    },


    /*
     * get an access token to pass to the render server
     */

    _processGetTokenProc: function(inParameters, json) {
        if (json.result.result_num == 0) {
            var accessInfo = new Object();

            // Store the time the access params were obtained -- used to count
            // against the lifetime param to expire the object.
            accessInfo.timestamp = this.utils.currentTimestamp();
            // Extract the lifetime param, no need to pass this along to the
            // rendering server.
            accessInfo.lifetime = parseInt(json.info.lifetime);
            delete json.info.lifetime;

            accessInfo.renderAccessParameters = json.info;

            inParameters.product.setAccessInfo(accessInfo);

            inParameters.successProc(this._buildRenderServerQueryParams(inParameters));
        } else {
            if (typeof inParameters.failProc == 'function') inParameters.failProc(json.result);
        }
    },

    /*
     * construct a URL with all user supplied and constructed parameters
     */

    _buildRenderServerQueryParams: function(inParameters) {
        var accessInfo = inParameters.product.getAccessInfo();

        var params = this.utils.merge(accessInfo.renderAccessParameters, inParameters.renderParameters);
        return params;
    },

    buildRenderServerUrlRequest: function(params) {
        var url = this.parameters.renderServer + "render-image?" + jQuery.param(params);
        return url;
    },

    /*
     * Verifies that valid access parameters are attached to the product.
     */

    _isRenderRequestAllowed: function(product) {
        var accessInfo = product.getAccessInfo();

        if (typeof accessInfo == 'object') {
            // Number of seconds to shave off the lifetime of the access params, this
            // allows a smooth re-request for a new set of access params.
            var expire_timestamp = accessInfo.timestamp + accessInfo.lifetime - this.parameters.refreshFuzzSeconds;
            if (this.utils.currentTimestamp() <= expire_timestamp) {
                return true;
            }
        }
        return false;
    },

    createRequestHandler: function(handler_object) {
        var uuid = this.utils.uuid();
        this.requests[uuid] = handler_object;
        // Embed the uuid in the handler object.
        this.requests[uuid].uuid = uuid;
        return uuid;
    },

    addRequestHandlerProperty: function(handler_object, property, value) {
        if (_.isObject(handler_object)) {
            var uuid = handler_object.uuid;
            if (uuid && _.isObject(this.requests[uuid])) {
                this.requests[uuid][property] = value;
                return handler_object;
            }
        }
    },

    removeRequestHandlerProperty: function(handler_object, property) {
        if (_.isObject(handler_object)) {
            var uuid = handler_object.uuid;
            if (uuid && _.isObject(this.requests[uuid])) {
                delete this.requests[uuid][property];
                // Only property remaining is the uuid, safe to clean up this
                // request object.
                if (_.size(this.requests[uuid]) == 1) {
                    delete this.requests[uuid];
                    return
                }
                return handler_object;
            }
        }
    },

    retrieveRequestHandlerById: function(uuid) {
        if (_.isObject(this.requests[uuid])) {
            var handler_object = this.requests[uuid];
            return handler_object;
        }
    },

    retrieveRequestHandler: function(json_result) {
        if (_.isObject(json_result) && !_.isUndefined(json_result.request_id)) {
            var uuid = json_result.request_id;
            return this.retrieveRequestHandlerById(uuid);
        }
    }

});


/*****************************************************************************
 ** Class: PijazProduct
 **
 ** Manages one Product
 **
 ** Constructor parameters:
 **
 **		serverManager       REQUIRED
 **		workflowId           REQUIRED
 **		renderParameters    optional
 **		attributes          optional
 **		previewManager      optional
 **		waitSpinnerDelegate optional
 **		notifyDelegate      optional
 **   previewUpdateDelay  optional    Delay before requesting a preview update, allows for skipping fast typing
 **
 **	 attributes: (these are generally autopopulated by an Ajax/JSON call to the api server )
 **
 **		categories		array of category id's this product belongs to
 **		startDate		Date product was first put into service
 **		workflowId		base name of workflow job
 **		id				product root id
 **		tnUrl			Thumbnail url
 **		tnWidth			Thumbnail width in pixels
 **		tnHeight		Thumbnail height in pixels
 **		imgWidth		Product image width
 **		imgHeight		Product image height
 **		title			Short title for this product
 **
 **  renderParameters is open ended, but these are typically supported params:
 **
 **		message			Primary message to display
 **		font			Font to use
 **		halign			Horizontal justification (left, center, right, full)
 **		valign			Vertical justification (top, middle, bottom, full, even )
 **		quality			JPEG quality to product (0-100)
 **		format			Image format ( "png" "tiff" or "jpeg" )
 **
 **
 **
 *****************************************************************************
 ** notifyDelegate object:
 **
 ** Optional event handler methods:
 **
 **     onParamaterChanged( keyChanged, oldValue, newValue )
 **
 **     onPreviewUpdateStart(finalParams)
 **
 **     onPreviewUpdateSuccess( img, url )
 **
 **     onSpinnerStart()
 **
 **     onSpinnerStop()
 **
 **     onPreviewUpdateFail( json_result )
 **         values on json_result object:
 **             json_result.result_num
 **             json_result.result_text
 **
 **     onGenerateShortCodeSuccess( json_result )
 **         values on json_result object:
 **             json_result.identifier
 **
 **     onGenerateShortCodeFail( json_result )
 **         values on json_result object:
 **             json_result.result_num
 **             json_result.result_text
 **
 ****************************************************************************/


var PijazProduct = IClass.extend({

    init: function(inParameters) {
        this.utils = new PijazUtil();
        this.controls = [];
        this.imageRequests = {};

        var defaultParams = {
            waitSpinnerDelegate: {},
            notifyDelegate: {},
            renderParameters: {},
            attributes: {},
            previewUpdateDelay : 500,       // 1/2 second
            fetchWidgetMetadata : true,
        }

        this.lastImageRequest = null;
        this.parameters = this.utils.merge(defaultParams, inParameters);
        this.image = null;
        this.delayedPreviewUpdate = null;
        this.productPropertyDefaults = {};
        if (this.parameters.fetchWidgetMetadata == true) {
          this.fetchWidgetMetadata();
        }
    },

    getWorkflowId : function() {
        return this.parameters.workflowId;
    },

    setWorkflowId : function( newWorkflowId, updatePreview ) {
      if (this.parameters.workflowId != newWorkflowId ) {
          delete this.accessInfo;
          this.parameters.workflowId = newWorkflowId;
          if (this.parameters.fetchWidgetMetadata == true) {
            this.fetchWidgetMetadata();
          }
          if ( typeof updatePreview == 'undefined' || updatePreview == true ) {
            this.updatePreview();
          }
        }
    },

    fetchWidgetMetadata : function() {
      var inParameters = {
          commandParameters: {
            command: "get-widget-metadata",
            type: this.parameters.workflowId,
          },
          successProc: _.bind( this._processFetchedWidgetMetadata, this),
      };
      if (typeof this.parameters.notifyDelegate.onFetchWidgetMetadataFail == 'function') {
        inParameters.failProc = _.bind( this.parameters.notifyDelegate.onFetchWidgetMetadataFail, this.parameters.notifyDelegate);
      }
      this.parameters.serverManager.executeRenderCommand(inParameters);
    },

    _processFetchedWidgetMetadata: function(inParameters, json) {
      if (json.result.result_num == 0) {
        var addProductDefaultProperty = function (property) {
          this.setRenderParameterDefault(property.id, property.default);
        }
        _.each(json.info.properties, _.bind(addProductDefaultProperty, this));
        if (typeof this.parameters.notifyDelegate.onFetchWidgetMetadataSuccess == 'function') {
          this.parameters.notifyDelegate.onFetchWidgetMetadataSuccess(json);
        }
      } else {
        if (typeof this.parameters.notifyDelegate.onFetchWidgetMetadataFail == 'function') {
          this.parameters.notifyDelegate.onFetchWidgetMetadataFail(json);
        }
      }
    },

    clearRenderParameters : function() {
        this.parameters.renderParameters = {};
    },

    /*
     ** method required by server manager
     */

    getAccessInfo: function() {
        return this.accessInfo;
    },

    /*
     ** method required by server manager
     */

    setAccessInfo: function(accessInfo) {
        if (typeof accessInfo == 'object') {
            this.accessInfo = accessInfo;
        }
        else {
            delete this.accessInfo;
        }
    },


    addSimpleControl: function( inParameters ) {
      if (typeof inParameters.controlNode === 'undefined')
        inParameters.controlNode = jQuery('#' + inParameters.key);

      var simpleControl =  new PijazSimpleControl( inParameters );

      return this.addControl(simpleControl);
    },

    addControl : function( newControl ) {
      if ( !newControl.getNotifyDelegate() )
        newControl.setNotifyDelegate( this );

      var value = newControl.getValue();
      if ( value != null )
        this.parameters.renderParameters[ newControl.getKey() ] = value;

      this.controls.push( newControl );
      return newControl;
    },

    getAttribute: function(attrKey) {
        return this.parameters.attributes[attrKey];
    },

    setAttribute: function(attrKey, attrValue) {
        this.parameters.attributes[attrKey] = attrValue;
    },

    setRenderParameter: function(key, newValue, updatePreview ) {
	    if ( this.parameters.renderParameters[key] != newValue ) {
			if ( key == 'workflowId' ) {
				this.setWorkflowId( newValue, false );
			}
	        if (_.isNull(newValue) || newValue == this.productPropertyDefaults[key]) {
	          delete this.parameters.renderParameters[key];
	        }
	        else {
	          this.parameters.renderParameters[key] = newValue;
	        }
	        if ( typeof updatePreview == 'undefined' || updatePreview == true ) {
	            this.updatePreview();
	        }
	    }
    },

    getRenderParameter: function(key) {
        var value = this.parameters.renderParameters[key];
        if (_.isUndefined(value)) {
          value = this.productPropertyDefaults[key];
        }
        return value;
    },

    setRenderParameterDefault: function(key, value) {
      this.productPropertyDefaults[key] = value;
    },


    notifyChanges : function( newValues, updatePreview ) {
        for( key in newValues ) {
            this.onChange( key, newValues[key], updatePreview );
        }
        if ( typeof updatePreview == 'undefined' || updatePreview == true )
            this.updatePreview();
    },

    notifyChange: function(key, newValue, updatePreview ) {
        this.onChange( key, newValue, updatePreview );
        if ( typeof updatePreview == 'undefined' || updatePreview == true )
            this.updatePreview();
    },

    onChange: function(key, newValue, updatePreview) {
        var oldValue = this.parameters.renderParameters[key];

        if ( newValue != oldValue ) {
            var doDefaultBehavior = true;
            if (typeof this.parameters.notifyDelegate.onParameterChanged == 'function') {
                doDefaultBehavior = this.parameters.notifyDelegate.onParameterChanged(key, oldValue, newValue);
            }

            if (doDefaultBehavior) {
                this.setRenderParameter(key, newValue, updatePreview);
            }
        }
    },

    updatePreview: function(additionalParams) {
        this._startSpinner();
        var finalParams = this.setFinalParams(additionalParams);
        var doDefaultBehavior = true;
        if (typeof this.parameters.notifyDelegate.onPreviewUpdateStart == 'function') {
            doDefaultBehavior = this.parameters.notifyDelegate.onPreviewUpdateStart(finalParams, this);
        }

        if (doDefaultBehavior) {
          var failProc;
          if (typeof this.parameters.notifyDelegate.onPreviewUpdateFail == 'function') {
              failProc = _.bind( this.parameters.notifyDelegate.onPreviewUpdateFail, this.parameters.notifyDelegate);
          }
          this.parameters.serverManager.buildRenderCommand({
              product: this,
              renderParameters: finalParams,
              successProc: _.bind( this._previewLoaded, this),
              failProc: failProc,
          });
        } else {
            this._stopSpinner();
        }
    },

    _startSpinner: function() {
        if (typeof this.parameters.waitSpinnerDelegate.start == 'function') {
            this.parameters.waitSpinnerDelegate.start();
            if (typeof this.parameters.notifyDelegate.onSpinnerStart == 'function') {
                this.parameters.notifyDelegate.onSpinnerStart();
            }
        }
    },

    _stopSpinner: function() {
        if (typeof this.parameters.waitSpinnerDelegate.stop == 'function') {
            this.parameters.waitSpinnerDelegate.stop();
            if (typeof this.parameters.notifyDelegate.onSpinnerStop == 'function') {
                this.parameters.notifyDelegate.onSpinnerStop();
            }
        }
     },

    _previewLoaded: function(params) {
        var url = this.parameters.serverManager.buildRenderServerUrlRequest(params);
        var uuid = this.utils.uuid();
        this.imageRequests[uuid] = {
            uuid: uuid,
            render_server_requests: 1,
        };
        this._previewUpdate(url, uuid);
    },

    _previewUpdate: function(url, uuid) {

        // DEBUG.
        //console.log("uuid: " + uuid + ", url: " + url);

        if ( this.delayedPreviewUpdate ) {
            clearTimeout( this.delayedPreviewUpdate );
        }

        if ( this.parameters.previewUpdateDelay ) {
            this.delayedPreviewUpdate = setTimeout( _.bind( this._processDelayedPreviewUpdate, this, url, uuid), this.parameters.previewUpdateDelay );
        }
        else {
            this._processDelayedPreviewUpdate( url, uuid );
        }
    },

    _processDelayedPreviewUpdate : function( url, uuid ) {

        // DEBUG.
        //console.log("updating image: " + url);
        this.delayedPreviewUpdate = null;

        // avoid wrong-order race conditions for updating image
        // TODO(michael): should this work from this.imageRequests object instead?
        if ( this.lastImageRequest ) {
          this.lastImageRequest.src = null;
          this.lastImageRequest.onload = null;
          this.lastImageRequest.onerror = null;
          this.lastImageRequest = null;
        }

        this.lastImageRequest = new Image();

        this.lastImageRequest.onload = _.bind( this._onImageLoad, this, this.lastImageRequest, uuid);
        this.lastImageRequest.onerror = _.bind( this._onImageError, this, this.lastImageRequest, url, uuid);
        this.lastImageRequest.src = url;
    },

    _onImageLoad: function(image, uuid) {
        this.lastImageRequest = null;
        image.onload = null;
        image.onerror = null;
        delete this.imageRequests[uuid];

        if (typeof this.parameters.previewManager == 'object') {
            // TODO: is there a clean way to do a straight copy of the loaded
            // image object w/o losing parameters on the existing preview object,
            // such as stylesheet, etc.
            this.parameters.previewManager.setImage(image);
        }

        this._stopSpinner();
        if (typeof this.parameters.notifyDelegate.onPreviewUpdateSuccess == 'function') {
            this.parameters.notifyDelegate.onPreviewUpdateSuccess(image, image.src, this);
        }
    },

    _onImageError: function(image, url, uuid) {
        this.lastImageRequest = null;
        image = null;

        if (!_.isUndefined(this.imageRequests[uuid]) && (this.imageRequests[uuid].render_server_requests < SERVER_REQUEST_ATTEMPTS)) {
            this.imageRequests[uuid].render_server_requests++;
            this._previewUpdate(url, uuid);
        }
        else {
            this._stopSpinner();
            delete this.imageRequests[uuid];

            if (typeof this.parameters.notifyDelegate.onPreviewUpdateFail == 'function') {
                var json = {
                    result: {
                        result_num: 1,
                        result_text: "Could not load image: " + url,
                    }
                };
                this.parameters.notifyDelegate.onPreviewUpdateFail(json);
            }
        }
    },

    getShortCode: function(additionalParams, type, source_context, destination_context) {
        // These arguments are stored as metadata with the short code.
        additionalParams._short_code_type = type;
        additionalParams._short_code_source_context = source_context;
        additionalParams._short_code_destination_context = destination_context;
        this.parameters.serverManager.buildRenderCommand({
            product: this,
            renderParameters: this.setFinalParams(additionalParams),
            successProc: _.bind( this._generateShortCode, this),
            failProc: _.bind( this.parameters.notifyDelegate.onGenerateShortCodeFail, this.parameters.notifyDelegate )
        });
    },

    _generateShortCode: function(params) {
      var inParameters = {
          command: "short-code/generate",
          commandParameters: params,
          successProc: _.bind( this._verifyShortCode, this),
          failProc: _.bind( this.parameters.notifyDelegate.onGenerateShortCodeFail, this.parameters.notifyDelegate)
      };
      this.parameters.serverManager.sendApiCommand(inParameters);
    },

    _verifyShortCode: function(json) {
        if (json.result.result_num == 0) {
            if (typeof this.parameters.notifyDelegate.onGenerateShortCodeSuccess == 'function') {
                this.parameters.notifyDelegate.onGenerateShortCodeSuccess(json);
            }
        } else {
            if (typeof this.parameters.notifyDelegate.onGenerateShortCodeFail == 'function') {
                this.parameters.notifyDelegate.onGenerateShortCodeFail(json);
            }
        }
    },

    setFinalParams: function(additionalParams) {
        var finalParams;

        if ( typeof additionalParams == 'object' ) {
            finalParams = this.utils.merge( this.parameters.renderParameters, additionalParams )
        } else {
            finalParams = this.parameters.renderParameters;
        }

        finalParams.workflow = this.parameters.workflowId;
        return finalParams;
    },

    createPreviewImage : function() {
        var image = new Image();

        // TODO(chad): May need to have more logic eventually than this
        // hard-coded approach.
        image.src = gUrlPrefix + "common/products/images/preview_com.pijaz.workflow." + this.getAttribute("workflowId") + '.jpg';

        return image;
    },

    createThumbnail : function() {
        var image = new Image();

        image.src = gUrlPrefix + "common/products/" + this.getAttribute("tnUrl");

        return image;
    },

});





/*****************************************************************************
 ** Class: PijazPreviewManager
 **
 ** Manage showing, updating and resizing an image preview
 **
 ** Constructor Attributes:
 **
 ** previewNode     REQUIRED    HTML node for showing preview
 ** autoResize		optional    true | false
 ** vPosition       optional    top | middle | bottom
 ** topMargin       optional    min margin between top of window and preview
 ** leftMargin      optional    min margin between left of window and preview
 ** rightMargin     optional    min margin between right of window and preview
 ** bottomMargin    optional    min margin between bottom of window and preview
 ****************************************************************************/

var PijazPreviewManager = IClass.extend({

    init: function(inAttributes) {
        this.utils = new PijazUtil();
        var defaultAttributes = {
            previewNode : null,
            imageNode : null,
            frameImagePrefix : "images/image_frame_",
            frameImageClass : "pijaz-frame",
            frameTableClass : "pijaz-frame",
            imageClass : "pijaz-preview-image",
            previewBorderSize : 22,
            vPosition : "middle",
            hPosition : "center",
            showFrame : false,
            autoResize: false,
            resizeMode: 'fit',      // 'fit' or 'fill'
            vPosition : top,
            topMargin : 0,
            bottomMargin : 0,
            leftMargin : 0,
            rightMargin : 0,
            maxSizeRatio : 1.25
        }

        this.attributes = this.utils.merge(defaultAttributes, inAttributes);
        this.lastWdwSize = this.utils.getWindowSize();
        this.animatePreviewTimer = null;
        this.animatePreviewSlideDeltaX = 0;
        this.animatePreviewDirection = 1;
        this.previousImageNode = null;

        if ( this.attributes.imageNode ) {
          this.image = $(this.attributes.imageNode);
          this.framedImageNode = this.image;
          if ( !this.image[0].naturalWidth ) {
            var image = this.image;
            this.image.bind( 'load', _.bind(this._setDimensions, this) );
          } else {
          this.imageNaturalWidth = this.image[0].naturalWidth;
          this.imageNaturalHeight = this.image[0].naturalHeight;
          this.setImage(this.image);
          this.image.css('display','block');
          }
        } else {
          this.image = $(new Image());
          this.framedImageNode = this.image;
          this.image.attr('class', this.attributes.imageClass);
          this.imageNaturalWidth = 1;
          this.imageNaturalHeight = 1;
        }

        if (this.attributes.autoResize) {
          this._updatePreviewNodeArea();
        }

        jQuery(this.attributes.previewNode).bind( 'mousedown', _.bind( this.onMouseDown, this));

        $(window).resize(_.bind( this.onWindowResize, this));
    },

    _setDimensions : function( node ) {
      this.imageNaturalWidth = this.image[0].naturalWidth;
      this.imageNaturalHeight = this.image[0].naturalHeight;
      this.setImage(this.image);
      this.image.css('display','block');
    },

    setPreviewArea : function( area ) {
        this.area = area;
        this._createNewFramedImage();
    },

    /*
     * Set preview to the specified image
     */

     // TODO:  need a better way to ensure all client values are preserved.  Perhaps client should provide a div and we put an img inside the div

     _moveAttributes : function( fromNode, toNode ) {
         toNode.className     = fromNode.className;
         toNode.id            = fromNode.id;
     },

     getImagePosition: function() {
         return { top: parseInt(this.framedImageNode.css('top')), left: parseInt(this.framedImageNode.css('left'))};
     },


     setImagePosition: function( position ) {
        if ( typeof position.top != 'undefined') {
            this.framedImageNode.css('top', position.top + "px");
        }
        if ( typeof position.left != 'undefined') {
            this.framedImageNode.css('left', position.left + "px");
        }
     },

    getImage: function() {
        return this.image;
    },

    getImageOriginalDimensions: function() {
        return { w:this.imageNaturalWidth, h:this.imageNaturalHeight };
    },

    setImage: function( imageNode ) {
        var deltaX = 0;

        this._moveAttributes( this.image[0], imageNode )
        this.image = $(imageNode);
        this.image.attr('class', this.attributes.imageClass);
        this.imageNaturalWidth = this.image[0].naturalWidth;
        this.imageNaturalHeight = this.image[0].naturalHeight;
        this.previousImageNode = this.framedImageNode;
        this.framedImageNode = this._createNewFramedImage();


        if (this.attributes.autoResize) {
             this.framedImageNode.css('position', 'absolute');
             this.refreshLayout();
             this.framedImageNode.css('left', (parseInt(this.framedImageNode.css('left')) - this.animatePreviewSlideDeltaX) + "px");
             setTimeout( _.bind( this._removeOldPreviews, this), 200 );
        } else {
            this.attributes.previewNode.children('img').remove();
            this.attributes.previewNode.css('display', 'block');
        }

        this.attributes.previewNode.append( this.framedImageNode );

        if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyPreviewChanged == 'function' ) {
            this.attributes.notifyDelegate.notifyPreviewChanged( this.image );
        }
    },

    _removeOldPreviews : function() {
      this.attributes.previewNode.children(':not(:last)').remove();
    },

    onMouseDown : function( ev ) {
        //ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },

    onWindowResize: function( ev ) {
      this.resize();
    },

    resize: function() {
        var newWdwSize = this.utils.getWindowSize();
        if ( newWdwSize.h != this.lastWdwSize.h || newWdwSize.w != this.lastWdwSize.w ) {
            this.lastWdwSize = newWdwSize;
            if (this.attributes.autoResize) {
              this._updatePreviewNodeArea();
              this.refreshLayout();
            }

            if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyPreviewResize == 'function' ) {
                this.attributes.notifyDelegate.notifyPreviewResize( this.image );
            }
        }
    },

    _updatePreviewNodeArea: function() {
        this.area = this._getPreviewNodeArea();
        this.attributes.previewNode.css('top', this.area.top + "px");
        this.attributes.previewNode.css('left', this.area.left + "px");
        this.attributes.previewNode.css('height',this.area.height + "px");
        this.attributes.previewNode.css('width', this.area.width + "px");
    },


    _getPreviewNodeArea: function() {
        var wdwSize = this.utils.getWindowSize();

        wdwSize.w -= this.attributes.leftMargin + this.attributes.rightMargin;
        wdwSize.h -= this.attributes.topMargin  + this.attributes.bottomMargin;
        return { width: wdwSize.w, height: wdwSize.h, left: this.attributes.leftMargin, top: this.attributes.topMargin };
    },

    getFittedArea: function() {
        var area = this._getPreviewNodeArea();

        if ( _.isFunction(this.attributes.resizeMode)) {
          var resizingFunction = _.bind(this.attributes.resizeMode, this.attributes.notifyDelegate);
          return resizingFunction(
            { w: area.width, h: area.height },
            { w: this.imageNaturalWidth, h: this.imageNaturalHeight },
            this.attributes.maxSizeRatio
          );
        }
        else if ( this.attributes.resizeMode == 'fit' ) {
          return this.utils.fitToArea(
              { w: area.width, h: area.height },
              { w: this.imageNaturalWidth, h: this.imageNaturalHeight },
              this.attributes.maxSizeRatio );
        } else {
          return this.utils.fillToArea(
              { w: area.width, h: area.height },
              { w: this.imageNaturalWidth, h: this.imageNaturalHeight },
              this.attributes.maxSizeRatio );

        }
    },

    getScaleRatio: function() {
        var fittedArea = this.getFittedArea();
        return fittedArea.ratio;
    },

    refreshLayout: function() {

        if ( this.imageNaturalWidth && this.imageNaturalHeight ) {
            this.area = this._getPreviewNodeArea();
            var fittedArea = this.getFittedArea();
            this.framedImageNode.css('left', fittedArea.x + "px");
            this.framedImageNode.css('top', fittedArea.y + "px");
            this.framedImageNode.css('width', fittedArea.w + "px");
            this.framedImageNode.css('height', fittedArea.h + "px");

            this.attributes.previewNode.css('display', "block");
            this.image.css('display', "block");
        }
    },


    /*
    ** Parameters:
    **
    ** tableClass, imageClass, renderWidth, renderHeight, previewNode, previewBorderSize
    */

    _createFrameHtml: function( attr, area ) {
        var rootNode  = jQuery(document.createElement("div"));
        var tableNode = jQuery(document.createElement("table"));
        var trNode;
        var width  = area.width;
        var height  = area.height;

        tableNode.className = attr.frameTableClass;
        tableNode.cellPadding = "0px";
        tableNode.cellSpacing = "0px";

        trNode = jQuery(document.createElement("tr"));
        trNode.append(this._createFrameTdNode(attr, "tl", attr.previewBorderSize, attr.previewBorderSize));
        trNode.append(this._createFrameTdNode(attr, "t",  width, attr.previewBorderSize));
        trNode.append(this._createFrameTdNode(attr, "tr", attr.previewBorderSize, attr.previewBorderSize));
        tableNode.append(trNode);

        trNode = jQuery(document.createElement("tr"));
        trNode.append(this._createFrameTdNode(attr, "l", attr.previewBorderSize, height));
        trNode.append(this._createFrameTdNode(attr, "c", width, height));
        trNode.append(this._createFrameTdNode(attr, "r", attr.previewBorderSize, height));
        tableNode.append(trNode);

        trNode = jQuery(document.createElement("tr"));
        trNode.append(this._createFrameTdNode(attr, "bl", attr.previewBorderSize, attr.previewBorderSize));
        trNode.append(this._createFrameTdNode(attr, "b",  width, attr.previewBorderSize));
        trNode.append(this._createFrameTdNode(attr, "br", attr.previewBorderSize, attr.previewBorderSize));
        tableNode.append(trNode);

        rootNode.append(tableNode);

        this.image.css('left',         attr.previewBorderSize + "px");
        this.image.css('top',          attr.previewBorderSize + "px");
        this.image.css('width',        width + "px");
        this.image.css('height',       height + "px");
        this.image.css('borderWidth',    (attr.previewBorderSize - 8) + "px");
        this.image.css('position',       "absolute");

        rootNode.append(this.image);
        return rootNode;
    },

    _createFrameTdNode: function(attr, imagePosition, width, height) {
        var tdNode = jQuery(document.createElement("td"));
        var imgNode = jQuery(new Image());
        imgNode.attr('src', attr.frameImagePrefix + imagePosition + ".png");
        imgNode.attr('class', attr.frameImageClass);
        imgNode.css('width', width + "px");
        imgNode.css('height', height + "px");
        tdNode.append(imgNode);
        return jQuery(tdNode);
    },

     _createNewFramedImage : function() {

         if ( this.attributes.showFrame ) {
             var area = this._calculatePreviewCoords( this.attributes, this.image );
             framedImageNode = this._createFrameHtml( this.attributes, area );
             framedImageNode.css('left', area.left   + "px");
             framedImageNode.css('top', area.top    + "px");
             framedImageNode.css('width', area.width  + "px");
             framedImageNode.css('height', area.height + "px");
         } else {
             framedImageNode = this.image;
             //framedImageNode.css('position', 'absolute');
         }

//      framedImageNode.style.width  = area.width + "px";
//      framedImageNode.style.height = area.height + "px";

         return framedImageNode;
     },


    _calculatePreviewCoords: function( attr, image ) {
        var renderWidth  = this.area.width;
        var renderHeight = this.area.height;
        var imageWidth   = image.width  - attr.previewBorderSize / 2;
        var imageHeight  = image.height - attr.previewBorderSize / 2;
        var xOffset      = 0;
        var yOffset      = 0;

        if ( !imageWidth || !imageHeight )
            return {
                left   : 0,
                top    : 0,
                width  : 1,
                height : 1
            }


        if (imageWidth > imageHeight) {
            renderHeight = imageHeight * this.area.width / imageWidth;
            renderWidth = this.area.width;
        } else {
            renderWidth = imageWidth * this.area.height / imageHeight;
            renderHeight = this.area.height;
        }

        switch( attr.hPosition ) {
            case "left":     xOffset = 0;    break;
            case "right":    xOffset = attr.previewBorderSize + this.area.width - renderWidth;  break;
            default:
            case "center":   xOffset = ((this.area.width - renderWidth) / 2) - attr.previewBorderSize;  break;
        }

        switch( attr.vPosition ) {
            case "top":      yOffset = 0;    break;
            case "bottom":   yOffset = attr.previewBorderSize + this.area.height - renderHeight;  break;
            default:
            case "middle":   yOffset = ((this.area.height - renderHeight) / 2) - attr.previewBorderSize;  break;
        }

        xOffset += this.area.left;
        yOffset += this.area.top;

        return {
            left   : Math.floor(xOffset),
            top    : Math.floor(yOffset),
            width  : Math.floor(renderWidth),
            height : Math.floor(renderHeight)
        }
    },


    animatePreviewCenter : function() {
        var curWidth = parseInt(this.framedImageNode.css('width'));
        var deltaX = (this.area.width - curWidth) / 2 - parseInt(this.framedImageNode.css('left'));
        this.animatePreviewSlideDeltaX = deltaX;
        this.animatePreviewSlide();
    },

    animatePreviewSlideRight : function() {
        var deltaX = this.area.width - parseInt(this.framedImageNode.css('left'));
        this.animatePreviewDirection = 1;
        this.animatePreviewSlideDeltaX = deltaX;
        this.animatePreviewSlide();
    },

    animatePreviewSlideLeft: function() {
        var deltaX = parseInt(this.framedImageNode.css('left')) + parseInt(this.framedImageNode.css('width'));
        this.animatePreviewDirection = -1;
        this.animatePreviewSlideDeltaX = -deltaX;
        this.animatePreviewSlide();
    },

    animatePreviewSlide: function() {
        var deltaX = this.animatePreviewSlideDeltaX;
        var dxThisRound = Math.ceil(deltaX / 5);
        if ( !dxThisRound ) dxThisRound = deltaX < 0 ? -1 : 1;
        deltaX = Math.floor(deltaX -= dxThisRound);
        this.animatePreviewSlideDeltaX = deltaX;
        var node = this.attributes.previewNode.children().get(0);
        while( node != null ) {
            if ( node.nodeType == 1) {
                node.style.left = (parseInt(node.style.left) + dxThisRound) + "px";
            }
            node = node.nextSibling;
        }

        if ( deltaX ) {
            this.animatePreviewTimer = setTimeout( _.bind( this.animatePreviewSlide, this), 50 );
        } else {
            this.animatePreviewTimer = null;
            this._removeOldPreviews();
            if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyPreviewSlideComplete == 'function' ) {
                this.attributes.notifyDelegate.notifyPreviewSlideComplete( this );
            }
        }
    }
});



/*****************************************************************************
 ** Class: PijazWaitSpinnerMultiframe
 **
 ** Show a banner of an arbitrary number of messages
 **
 ** Constructor Attributes:
 **
 ** spinnerNode             REQUIRED    HTML DIV node to receive spinner images
 ** spinnerRootName         optional    Defaults to '/common/images/pijaz-spinner-'
 ** spinnerFrameCount       optional    Defaults to 12
 ** spinnerExtension        optional    Defaults to '.png'
 ** initialDelay            optional    Delay in milliseconds before showing
 ** opacity                 optional    Opacity of spinner over background elements
 ** millisecondsPerIter     optional    Delay between rotation interations
 ****************************************************************************/

var PijazWaitSpinnerMultiframe = IClass.extend({
    init: function( inParameters ) {
        this.utils = new PijazUtil();
        this.frames = [];

        var defaultAttributes = {
            degreesPerIter : 30,
            initialDelay : 500,
            opacity : 1.0,
            enabled: true,
            spinnerNode : jQuery("#pijaz-spinner"),
            spinnerRootName : "/common/images/pijaz-spinner-",
            spinnerExtension : ".png",
            spinnerFrameCount : 12,
            millisecondsPerIter : 100
        };

        this.attributes = this.utils.merge( defaultAttributes, inParameters );

        for( var f = 0; f < this.attributes.spinnerFrameCount; f++ ) {
            this.frames[f] = new Image();
            this.frames[f].src = this.attributes.spinnerRootName + f + this.attributes.spinnerExtension;
        //DEBUG    this.frames[f].setOpacity(this.attributes.opacity);
        }

        this.currentFrame = 0;
        this.timer = null;
        this.done = false;
    },

    start: function(initialDelay) {
      if ( this.attributes.enabled ) {
        if( typeof initialDelay == "undefined") initialDelay = this.attributes.initialDelay;

        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.done = false;
        this.currentFrame = 0;
        this.timer = setTimeout(_.bind( this._nextFrame, this), initialDelay);
        this.attributes.spinnerNode.css('display', "block");
      }
    },

    stop: function() {
        this.done = true;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.attributes.spinnerNode.css('display', "none");
    },

    _nextFrame: function() {
        this.attributes.spinnerNode.empty();
        this.attributes.spinnerNode.append( this.frames[ this.currentFrame ] );
        if ( ++this.currentFrame == this.attributes.spinnerFrameCount )
            this.currentFrame = 0;

        if (this.done == false) this.timer = setTimeout(_.bind( this._nextFrame, this), this.attributes.millisecondsPerIter);
    }

});

// Slurp in the query parameters.
var gQueryParams = _.isUndefined(gQueryParams) ? {} : gQueryParams;
var buildQueryParams = function(value, key) {
  gQueryParams[key] = value;
}
_.each(purl().param(), buildQueryParams);

// This necessary because PhoneGap can't handle absolute paths for URLs.
var gUrlPrefix = '/';
var missingPhoneGapVar = typeof gIsPhoneGapBuild === 'undefined';
if (!missingPhoneGapVar && gIsPhoneGapBuild) {
    gUrlPrefix = '';
}

