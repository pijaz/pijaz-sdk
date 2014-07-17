

 /*****************************************************************************
  ** Class: PijazSimpleControl
  **
  ** Base control class for managing a control.  All controls derive from this
  ** class.
  **
  ** Constructor parameters:
  **
  ** controlNode            REQUIRED    Element for actual input control
  ** key                    REQUIRED    Key for attribute that this drop down manages
  ** defaultValue           optional    Default value (this is the key if an associative array is provided for the valueList)
  ** notifyDelegate         optional    Delegate object to receive event notifications from the control.
  ****************************************************************************/

 var PijazSimpleControl = IClass.extend({
     init : function( inParameters, additionalAttributes ) {
         this.utils = new PijazUtil();

         var defaultAttributes = {
             valueToParameter: function(value) { return value; }
         };

         defaultAttributes = this.utils.merge( defaultAttributes, additionalAttributes );
         this.attributes   = this.utils.merge( defaultAttributes, inParameters );

         this.listeners = {
             onChange: _.bind( this.onChange, this),
             onFocus: _.bind( this.onFocus, this),
             onBlur: _.bind( this.onBlur, this),
         };

         this.controlNode = jQuery(this.attributes.controlNode);
         if ( typeof this.attributes.defaultValue != 'undefined' ) {
           var value = this.attributes.valueToParameter( this.attributes.defaultValue );
           this.setValue( value );
         }

         jQuery(this.controlNode).focus(this.listeners.onFocus);
         jQuery(this.controlNode).blur(this.listeners.onBlur);
         if ( this.controlNode.prop('tagName') == 'INPUT' || this.controlNode.prop('tagName') == 'TEXTAREA' ) {
           jQuery(this.controlNode).keyup(this.listeners.onChange);
         } else {
           jQuery(this.controlNode).bind('change', this.listeners.onChange);
         }
     },

     getKey : function() {
       return this.attributes.key;
     },

     getNotifyDelegate : function() {
       return this.attributes.notifyDelegate || null;
     },

     setNotifyDelegate : function(notifyDelegate) {
       this.attributes.notifyDelegate = notifyDelegate;
     },

     hide : function() {
         this.controlNode.css('opacity', 0.0 );
     },

     show : function() {
       this.controlNode.css('opacity', 1.0 );
     },

     getValue : function( ) {
       if ( this.controlNode )
         return this.attributes.valueToParameter( this.controlNode.val() );
     },

     setValue : function( value ) {
         if ( this.controlNode )
             this.controlNode.val(value);
     },

     onChange: function(ev) {
       var val = this.controlNode.val();
       this.notifyChange(val);
     },

     notifyChange : function( newValue ) {
       var delegate = this.attributes.notifyDelegate;
       if ( typeof delegate == 'object' && typeof delegate.notifyChange == 'function' ) {
         delegate.notifyChange( this.attributes.key, this.getValue() );
       }
     },

     onFocus: function(ev) {
       this.notifyFocus();
     },

     notifyFocus: function() {
       var delegate = this.attributes.notifyDelegate;
       if ( typeof delegate == 'object' && typeof delegate.notifyFocus == 'function' ) {
         delegate.notifyFocus(this.attributes.key);
       }
     },

     onBlur: function(ev) {
       this.notifyBlur();
     },

     notifyBlur: function() {
       var delegate = this.attributes.notifyDelegate;
       if ( typeof delegate == 'object' && typeof delegate.notifyBlur == 'function' ) {
         delegate.notifyBlur(this.attributes.key);
       }
     },

     getControlNode : function() {
         return this.controlNode;
     }
 });





/*****************************************************************************
 ** Class: PijazControl
 **
 ** Base control class for managing a control.  All controls derive from this
 ** class.
 **
 ** Constructor parameters:
 **
 ** parentNode             REQUIRED    HTML DIV of container to recieve this control
 ** controlNode            REQUIRED    HTML element for actual control container
 ** key                    REQUIRED    Key for attribute that this drop down manages
 ** title                  optional    Title to display for this control
 ** cssClassName           optional    CSS class name
 ** defaultValue           optional    Default value (this is the key if an associative array is provided for the valueList)
 ** top                    optional    absolute top location in pixels
 ** left                   optional    absolute left location in pixels
 ** width                  optional    width in pixels
 ** height                 optional    height in pixels
 ** notifyDelegate         optional    Delegate object to receive event notifications from the control.
 ****************************************************************************/

var PijazControl = IClass.extend({
    init : function( inParameters, additionalAttributes ) {
        this.utils = new PijazUtil();

        var defaultAttributes = {
            notifyDelegate : {},
            valueToParameter : function( value ) { return value; },
            cssClassName : 'pijaz-control-container',
            parentNode : $('#pijaz-controls')
        };

        defaultAttributes = this.utils.merge( defaultAttributes, additionalAttributes );
        this.attributes   = this.utils.merge( defaultAttributes, inParameters );

        var controlNode = this.attributes.controlNode;

        controlNode.addClass( this.attributes.cssClassName );
        this.setValue( this.attributes.defaultValue );

        this.divNode = $(document.createElement("div"));
        this.divNode.addClass( this.attributes.cssClassName );

        if ( typeof this.attributes.width != 'undefined' ) {
            this.divNode.css( 'width', this.attributes.width + "px" );
            controlNode.css( 'width', this.attributes.width + "px" );
        } else {
            controlNode.css( 'width', "95%" );
        }

        if ( typeof this.attributes.height != 'undefined' ) {
            this.divNode.css( 'height', this.attributes.height + "px" );
        }

        if ( typeof this.attributes.left != 'undefined' ) {
            this.divNode.css( 'left', this.attributes.left + "px" );
        }

        if ( typeof this.attributes.top != 'undefined' ) {
            this.divNode.css( 'top', this.attributes.top + "px" );
        }

        if ( typeof this.attributes.title != 'undefined' ) {
            var titleNode = $('<div/>', {
              'class': 'pijaz-control-title'
            });
            titleNode.html(this.attributes.title);

            this.divNode.append(titleNode);
        }

        this.divNode.append(this.attributes.controlNode);

        this.show();

    },

    getKey : function() {
      return this.attributes.key;
    },

    getNotifyDelegate : function() {
      return this.attributes.notifyDelegate || null;
    },

    setNotifyDelegate : function(notifyDelegate) {
      this.attributes.notifyDelegate = notifyDelegate;
    },

    hide : function() {
        if ( this.attributes.parentNode )
            this.attributes.parentNode.remove(this.divNode);
    },

    show : function() {
        if ( this.attributes.parentNode )
            this.attributes.parentNode.append(this.divNode);
    },

    getValue : function( ) {
        if ( this.attributes.controlNode )
            return this.attributes.controlNode.val();
    },

    setValue : function( value ) {
        if ( this.attributes.controlNode )
            this.attributes.controlNode.val( value );
    },

    notifyChange : function( newValue ) {
        var delegate = this.attributes.notifyDelegate;
        if ( typeof delegate == 'object' && typeof delegate.notifyChange == 'function' ) {
          newValue = this.attributes.valueToParameter( newValue );
          delegate.notifyChange( this.attributes.key, newValue );
        }
    },

    getControlNode : function() {
        return this.attributes.controlNode;
    }
});



 /*****************************************************************************
  ** Class: PijazDropDownControl
  **
  ** Displays a DropDown that notifies owning notifyDelegate of changes
  **
  ** Constructor Parameters:
  **
  ** NOTE: Also see constructor attributes for super class: PijazControl
  **
  ** valueList              REQUIRED    Indexed or associative array of items to display in drop down
  ****************************************************************************/

var PijazDropDownControl = PijazControl.extend({
    init: function( inParameters ) {


        this._super( inParameters, {
                            cssClassName : 'pijaz-dropdown-container',
                            controlNode : $(document.createElement("select"))
                            } );

        this.listeners = {
            onChange: _.bind(this.onChange, this)
        };

        var valueList = this.attributes.valueList;

        if (valueList.length) {
            for (var i = 0; i < valueList.length; i++) {
                var isDefault = ( typeof this.attributes.defaultValue == 'undefined' ) ? i == 0 : valueList[i] == this.attributes.defaultValue;

                this.addItem(valueList[i].key, valueList[i].title, isDefault );
            }
        } else {
            for (var key in valueList) {
                var isDefault = ( typeof this.attributes.defaultValue == 'undefined' ) ? i == 0 : key == this.attributes.defaultValue;
                this.addItem(key, valueList[key], isDefault );
            }
        }

        this.attributes.controlNode.bind( 'change', this.listeners.onChange);

    },

    addItem: function(valueKey, label, isDefault) {
        var optionNode = $(document.createElement("option"));
        optionNode.label = label;
        optionNode.html(label);
        optionNode.val( valueKey );
        optionNode.selected = isDefault;
        this.attributes.controlNode.append(optionNode);
    },

    onChange: function(ev) {
        var value = this.attributes.controlNode.val();
        this.notifyChange( value );
    }
});

/*****************************************************************************
 ** Class: PijazTextAreaControl
 **
 ** Displays a TextArea that notifies owning notifyDelegate of changes
 **
 ** Constructor Parameters:
 **
 ** NOTE: Also see constructor attributes for super class: PijazControl
 **
 ** charWidth   REQUIRED    Character width of textarea
 ** charRows    REQUIRED    Character height of text area
 ****************************************************************************/

var PijazTextAreaControl = PijazControl.extend({
    init: function( inParameters ) {

        var controlNode;
        var defaultCssClassName;

        var defaultAttributes = {
            'charWidth' : 50,
            'autoResize' : false,
            'resizeMinRows' : 1,
            'resizeMaxRows' : 5,
            'resizeRowHeight': 18
            }

        defaultAttributes = new PijazUtil().merge( defaultAttributes, inParameters );

        if (defaultAttributes.charRows == 1 && defaultAttributes.resizeMaxRows == 1) {
             controlNode = $(document.createElement("input"));
             defaultCssClassName = 'pijaz-textedit-container'
         } else {
             controlNode = $(document.createElement("textarea"));
             defaultCssClassName = 'pijaz-textarea-container'
         }


        this._super( defaultAttributes, {
            'controlNode' : controlNode,
            'cssClassName' : defaultCssClassName
            } );

        this.attributes.controlNode.attr('rows', this.attributes.charRows);
        this.attributes.controlNode.attr('cols', this.attributes.charWidth);

        this.currentPixelHeight = this.attributes.controlNode.attr('offsetHeight');
        this.resizeTimer = null;
        this.currentRowCount = controlNode.attr('rows');
        // This to properly set the initial size.
        this.currentLineCount = 1;
        this._checkLineCountChange();

        this.listeners = {
            onKeyUp: _.bind( this.onKeyUp, this),
            onClick: _.bind( this.onClick, this),
            onFocus: _.bind( this.onFocus, this),
            onBlur: _.bind( this.onBlur, this),
        };

        this.attributes.controlNode.bind('keyup', this.listeners.onKeyUp);
        this.attributes.controlNode.bind('click', this.listeners.onClick);
        this.attributes.controlNode.bind('focus', this.listeners.onFocus);
        this.attributes.controlNode.bind('blur', this.listeners.onBlur);

    },

    focus: function() {
        this.attributes.controlNode.focus();
    },

    blur: function() {
        this.attributes.controlNode.blur();
    },

    select: function() {
        this.attributes.controlNode.select();
    },

    onClick: function(ev) {
        if (this.attributes.controlNode.val() == this.attributes.defaultValue) {
            this.select();
            this.focus();
        }
    },

    onKeyUp: function(ev) {
        var value = this.getTextValue();

        this._checkLineCountChange( value );
        this.notifyChange( value );
    },

    onFocus: function(ev) {
        if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyFocus == 'function' ) {
            this.attributes.notifyDelegate.notifyFocus( this );
        }
    },

    onBlur: function(ev) {
        if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyBlur == 'function' ) {
            this.attributes.notifyDelegate.notifyBlur( this );
        }
    },

    _checkLineCountChange : function( value ) {
        if ( this.attributes.autoResize ) {
            var newLineCount = this.getLineCount();

            if (newLineCount < this.attributes.resizeMinRows) {
                newLineCount = this.attributes.resizeMinRows;
            }

            if (newLineCount > this.attributes.resizeMaxRows) {
                newLineCount = this.attributes.resizeMaxRows;
            }

            var operation;
            if (newLineCount < this.currentLineCount) {
              operation = 'shrink';
            }
            if (newLineCount > this.currentLineCount) {
              operation = 'grow';
            }

            if ( operation ) {
                var deltaHeight = (newLineCount - this.currentLineCount) * this.attributes.resizeRowHeight;
                var deltaThisIter = Math.ceil(deltaHeight / 10);
                this._animateResize(operation, deltaHeight, deltaThisIter);
                this.currentLineCount = newLineCount;
            }
        }
    },

    _animateResize : function(operation, deltaHeight, deltaThisIter) {
        var minPixelHeight = this.attributes.resizeRowHeight * this.attributes.resizeMinRows;
        var maxPixelHeight = this.attributes.resizeRowHeight * this.attributes.resizeMaxRows;
        // These checks necesary to make sure the text area never goes
        // outside the allowed range. The last check makes sure that we
        // don't auto shrink if the user has expanded the textarea beyond
        // our autosizing bounds.
        if ( (operation == 'grow' && this.currentPixelHeight < maxPixelHeight) || (operation == 'shrink' && this.currentPixelHeight > minPixelHeight) || (operation == 'shrink' && !(this.currentPixelHeight > maxPixelHeight))) {
            this.currentPixelHeight += deltaThisIter;
            this.attributes.controlNode.css( 'height', this.currentPixelHeight + 'px' );
            if ( typeof this.attributes.notifyDelegate == 'object' && typeof this.attributes.notifyDelegate.notifyResize == 'function' ) {
                this.attributes.notifyDelegate.notifyResize( this.currentPixelHeight - deltaThisIter, this.currentPixelHeight );
            }

            deltaHeight -= deltaThisIter;
            if ( (deltaHeight < 0 && deltaThisIter < deltaHeight) ||
                 (deltaHeight > 0 && deltaThisIter > deltaHeight) ) {
                 deltaThisIter = deltaHeight;
            }

            if ( deltaHeight ) {
                this.resizeTimer = setTimeout( _.bind(this._animateResize, this, operation, deltaHeight, deltaThisIter), 20 );
            } else {
                this.resizeTimer = null;
            }
        }
    },

    getLineCount: function() {
        return this.attributes.controlNode.val().split("\n").length;
    },

    getTextValue : function() {
         var value = this.attributes.controlNode.val();

         if (this._trim(value) == "") {
             value = this.attributes.defaultValue;
         }
         return value;
    },

    _getLineCount: function() {

    },

    _trim: function(strText) {
        // this will get rid of leading spaces
        while (strText.substring(0, 1) == ' ')
        strText = strText.substring(1, strText.length);

        // this will get rid of trailing spaces
        while (strText.substring(strText.length - 1, strText.length) == ' ')
        strText = strText.substring(0, strText.length - 1);

        return strText;
    }

});


/*****************************************************************************
 ** Class: PijazTextEditControl
 **
 ** Displays a one-line textedit field that notifies owning notifyDelegate of changes
 **
 ** Constructor Parameters:
 **
 ** NOTE: Also see constructor attributes for super classes: PijazTextAreaControl and PijazControl
 **
 ****************************************************************************/
var PijazTextEditControl = PijazTextAreaControl.extend({
    init: function( inParameters ) {
        inParameters.charRows = 1;

        if ( typeof inParameters.cssClassName == 'undefined' && typeof inParameters.height == 'undefined' ) {
            inParameters.height = 18;
        }

        this._super( inParameters );
    }
});


/*****************************************************************************
 ** Class: PijazSliderControl
 **
 ** Displays a one-line textedit field that notifies owning notifyDelegate of changes
 **
 ** Constructor Parameters:
 **
 ** NOTE: Also see constructor attributes for super class: PijazControl
 **
 ** min     optional            min control value.  Default = 0
 ** max     optional            max control value.  Default = 1
 **
 ****************************************************************************/

var PijazSliderControl = PijazControl.extend({
    init: function( inParameters ) {

        var controlNode = inParameters.controlNode || $('<div/>', {
          id: inParameters.key + '-slider'
        });

        this._super( inParameters, {
            'min' : 1,
            'max' : 100,
            'step' : 1,
            'handles': 1,
            'orientation': 'horizontal',
            'cssClassName' : 'pijaz-slider-container',
            'controlNode' :  controlNode
        });

        this.slider = controlNode.noUiSlider({
            range: [this.attributes.min, this.attributes.max],
            step: this.attributes.step,
            start: this.attributes.defaultValue,
            handles: this.attributes.handles,
            orientation: this.attributes.orientation,
            set: _.bind(this.onChange, this),
        });

    },

    onChange: function() {
        var finalVal = this.slider.val();
        this.notifyChange( finalVal );
    }
});




/*****************************************************************************
 ** Class: PijazAnchorControl
 **
 ** Displays a moveable corner anchor. Generally only used internally
 ** by other PijazControls, but can be used by custom user controls
 **
 ** Constructor Parameters:
 **
 **     anchor_class            CSS class for corner anchors
 **     anchor_image_url        url for corner anchors
 **     notifyDelegate          what object to notify when anchor moves
 **                                 notifyAnchorMoved, notifyAnchorIsMoving
 **     parentNode             parent HTML container node
 **     param_key_x             the Pijaz render key of the x parameter
 **     param_key_y             the Pijaz render key of the y parameter
 **     img_offset_x            x offset for showing the corner anchors
 **     img_offset_y            y offset for showing the corner anchors
 **     x                       x position for anchor
 **     y                       y position for anchor
 **
 **
 **
 ****************************************************************************/


var PijazAnchorControl = IClass.extend({

    init: function(inParameters) {
        this.utils = new PijazUtil();
        this.isDragging = false;

        var defaultParameters = {
            anchor_class : "pijaz-anchor",
            anchor_image_url : "images/anchor.png",
            parentNode: $("#pijaz-anchors"),
            param_key_x: "position_x",
            param_key_y: "position_y",
            img_offset_x : -10,             //1/2 circle image radius to center circle on (x,y)
            img_offset_y : -10,
            x: 0,
            y: 0
        };

        this.parameters = this.utils.merge(defaultParameters, inParameters);

        this.imgNode = $(document.createElement( "img" ));

        if ( typeof navigator != 'undefined' ) {
            if ( navigator.userAgent.indexOf("Mobile") != -1 ) {
                this.imgNode.css( 'width', "40px" );
                this.imgNode.css( 'height', "40px" );
                this.parameters.img_offset_x *= 2;
                this.parameters.img_offset_y *= 2;
            }
        }

        this.imgNode.attr('src', this.parameters.anchor_image_url);
        this.imgNode.addClass( this.parameters.anchor_class );
        this.imgNode.css( 'position', "absolute" );
        this.imgNode.css( 'left', (this.parameters.img_offset_x + this.parameters.x) + "px" );
        this.imgNode.css( 'top', (this.parameters.img_offset_y + this.parameters.y) + "px" );

        this.parameters.parentNode.append( this.imgNode );

        this.listeners = {
            onMouseDown:  _.bind( this.onMouseDown, this),
            onTouchStart: _.bind( this.onTouchStart, this),
            onMouseMove:  _.bind( this.onMouseMove, this),
            onTouchMove:  _.bind( this.onTouchMove, this),
            onMouseUp:    _.bind( this.onMouseUp, this),
            onTouchEnd:   _.bind( this.onTouchEnd, this)
        };

        this.imgNode.bind( 'touchstart', this.listeners.onTouchStart);
        this.imgNode.bind( 'mousedown', this.listeners.onMouseDown);
        },

        getPosition : function() {
            var x = parseInt( this.imgNode.css( 'left' ) ) - this.parameters.img_offset_x;
            var y = parseInt( this.imgNode.css( 'top' )  ) - this.parameters.img_offset_y;

            return { x : x, y : y };
        },

        setPosition : function( x, y ) {
            this.imgNode.css( 'left', (this.parameters.img_offset_x + x) + "px" );
            this.imgNode.css( 'top', (this.parameters.img_offset_y + y) + "px" );
        },

        setOpacity : function( opacity ) {
            this.imgNode.css('opacity', opacity );
        },

        getParamKeyX : function() {
            return this.parameters.param_key_x;
        },

        getParamKeyY : function() {
            return this.parameters.param_key_y;
        },


        onTouchStart : function( ev ) {
            var x = ev.touches[0].pageX;
            var y = ev.touches[0].pageY;
            this._dragStart( x, y );
            ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        },

        onMouseDown : function( ev ) {
            var x = ev.clientX;
            var y = ev.clientY;
            this._dragStart( x, y );
            ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        },

        _dragStart : function( x, y ) {
            this.isDragging = true;
            this.imageAnchorX = parseInt( this.imgNode.css( 'left' ) );
            this.imageAnchorY = parseInt( this.imgNode.css( 'top' ) );
            this.dragAnchorX = x;
            this.dragAnchorY = y;

            $(document).bind("mousemove", this.listeners.onMouseMove);
            $(document).bind("touchmove", this.listeners.onTouchMove);
            $(document).bind('mouseup', this.listeners.onMouseUp);
            $(document).bind('touchend', this.listeners.onTouchEnd);
        },

        onTouchEnd : function( ev ) {
            var x = ev.changedTouches[0].pageX;
            var y = ev.changedTouches[0].pageY;
            this._dragEnd( x, y );
        },

        onMouseUp : function( ev ) {
            var x = ev.clientX;
            var y = ev.clientY;
            this._dragEnd( x, y );
        },

        _dragEnd : function( x, y ) {
            this.isDragging = false;

            $(document).unbind("mousemove", this.listeners.onMouseMove);
            $(document).unbind("touchmove", this.listeners.onTouchMove);
            $(document).unbind('touchend', this.listeners.onTouchEnd);
            $(document).unbind('mouseup', this.listeners.onMouseUp);

            var x = parseInt( this.imgNode.css( 'left' ) ) - this.parameters.img_offset_x;
            var y = parseInt( this.imgNode.css( 'top' )  ) - this.parameters.img_offset_y;
            if ( typeof this.parameters.notifyDelegate == 'object' && typeof this.parameters.notifyDelegate.notifyAnchorMoved == 'function' ) {
                this.parameters.notifyDelegate.notifyAnchorMoved( { x : x, y : y, x_key : this.parameters.param_key_x, y_key : this.parameters.param_key_y } );
            }
        },

        onTouchMove : function( ev ) {
            var x = ev.touches[0].pageX;
            var y = ev.touches[0].pageY;
            this._dragMove( x, y );
            ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;

        },

        onMouseMove : function( ev ) {
            var x = ev.clientX;
            var y = ev.clientY;
            this._dragMove( x, y );
            ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        },

        _dragMove : function( x, y ) {
            if (this.isDragging) {
                var dx = this.dragAnchorX - x;
                var dy = this.dragAnchorY - y;

                this.imgNode.css( 'left', (this.imageAnchorX - dx) + "px" );
                this.imgNode.css( 'top', (this.imageAnchorY - dy) + "px" );

                x = parseInt( this.imgNode.css( 'left' ) ) - this.parameters.img_offset_x;
                y = parseInt( this.imgNode.css( 'top' )  ) - this.parameters.img_offset_y;

                if ( typeof this.parameters.notifyDelegate == 'object' && typeof this.parameters.notifyDelegate.notifyAnchorIsMoving == 'function' ) {
                    this.parameters.notifyDelegate.notifyAnchorIsMoving( { x : x, y : y, x_key : this.parameters.param_key_x, y_key : this.parameters.param_key_y } );
                }
            }
        }

});


/*****************************************************************************
 ** Class: PijazBezierPathControl
 **
 **   manage showing and editing a bezier curve
 **
 ** Constructor Parameters:
 **
 **   endPt1.x
 **   endPt1.y
 **   endPt2.x
 **   endPt2.y
 **   controlPt1.x
 **   controlPt1.y
 **   controlPt2.x
 **   controlPt2.y
 **
 ****************************************************************************/

 var PijazBezierPathControl = IClass.extend({
     init: function(inParameters) {
         this.utils = new PijazUtil();
         this.anchorOpacity = 1.0;
         this.dragZone = -1;

         var defaultParameters = {
             previewNode: $("#pijaz-preview"),
             parentNode: $("#pijaz-path"),
             param_prefix: "",
             endPt1: {x:0,y:0},
             endPt2: {x:100,y:100},
             controlPt1: {x:50,y:0},
             controlPt2: {x:50,y:100}
         };

         this.parameters = this.utils.merge(defaultParameters, inParameters);

         if ( typeof this.parameters.previewNode == 'undefined' ) {
             this.parameters.previewNode = this.parameters.parentNode;
         }
         this.parameters.previewNode = $(this.parameters.previewNode);

         if ( typeof this.parameters.parentNode == 'undefined' ) {
             this.parameters.parentNode = this.parameters.previewNode;
         }
         this.parameters.parentNode = $(this.parameters.parentNode);

         this.renderParameters = r;

         var pfx = this.parameters.param_prefix;
         r[ pfx + "endPt1_x"     ] = this.parameters.endPt1.x;
         r[ pfx + "endPt1_y"     ] = this.parameters.endPt1.y;
         r[ pfx + "endPt2_x"     ] = this.parameters.endPt2.x;
         r[ pfx + "endPt2_y"     ] = this.parameters.endPt2.y;
         r[ pfx + "controlPt1_x" ] = this.parameters.controlPt1.x;
         r[ pfx + "controlPt1_y" ] = this.parameters.controlPt1.y;
         r[ pfx + "controlPt2_x" ] = this.parameters.controlPt2.x;
         r[ pfx + "controlPt2_y" ] = this.parameters.controlPt2.y;
     }
 });

/*****************************************************************************
 ** Class: PijazQuadrilateralControl
 **
 ** Displays a moveable/shapable quadrilateral.
 **
 ** Constructor Parameters:
 **
 **     anchor_class            class to use for corner anchors
 **     parentNode             HTML container node
 **		x0
 **		y0
 **     x1
 **     y1
 **     x2
 **     y2
 **     x3
 **     y3
 **     quad_param_prefix
 **     offset_param_prefix
 **
 **
 **
 ****************************************************************************/

var PijazQuadrilateralControl = IClass.extend({

    init: function(inParameters) {
        this.utils = new PijazUtil();
        this.anchorOpacity = 1.0;
        this.dragZone = -1;

        var defaultParameters = {
            anchor_class : "pijaz-anchor",
            previewNode: $("#pijaz-preview"),
            parentNode: $("#pijaz-quadrilateral"),
            quad_param_prefix: "",
            offset_param_prefix: "offset_",
            drag_border : 0,
            quadrilateral : {
                offset_x : 0,
                offset_y : 0,
                x0: 0,
                y0: 0,
                x1: 100,
                y1: 0,
                x2: 100,
                y2: 100,
                x3: 0,
                y3: 100
            },
            zones : []
        };

        this.parameters = this.utils.merge(defaultParameters, inParameters);

        if ( typeof this.parameters.previewNode == 'undefined' ) {
            this.parameters.previewNode = this.parameters.parentNode;
        }
        this.parameters.previewNode = $(this.parameters.previewNode);

        if ( typeof this.parameters.parentNode == 'undefined' ) {
            this.parameters.parentNode = this.parameters.previewNode;
        }
        this.parameters.parentNode = $(this.parameters.parentNode);

        this.dragZone = -1;
        this.dragDiv = $(document.createElement("div"));
        this.dragDiv.css( 'opacity', 0 );
        this.dragDiv.css( 'backgroundColor', "white" );
        this.dragDiv.css( 'position', "absolute" );
        this.dragDiv.css( 'borderStyle', "solid" );
        this.dragDiv.css( 'borderWidth', "2px" );
        this.dragDiv.css( 'borderColor', "white" );
        this._updateDragDivArea();
        this.parameters.parentNode.append( this.dragDiv );

        var cOffset = this.parameters.previewNode.offset();

        var qPfx = this.parameters.quad_param_prefix;
        var quad = this.parameters.quadrilateral;
        var offX = quad.offset_x + cOffset.left;
        var offY = quad.offset_y + cOffset.top;

        this.anchorUL = new PijazAnchorControl({
            anchor_image_url : this.parameters.anchor_image_url,
            param_key_x : "x0",
            param_key_y : "y0",
            x : offX + quad.x0,
            y : offY + quad.y0,
            notifyDelegate : this } );

        this.anchorUR = new PijazAnchorControl({
            anchor_image_url : this.parameters.anchor_image_url,
            param_key_x : "x1",
            param_key_y : "y1",
            x : offX + quad.x1,
            y : offY + quad.y1,
            notifyDelegate : this } );

        this.anchorLR = new PijazAnchorControl({
            anchor_image_url : this.parameters.anchor_image_url,
            param_key_x : "x2",
            param_key_y : "y2",
            x : offX + quad.x2,
            y : offY + quad.y2,
            notifyDelegate : this } );

        this.anchorLL = new PijazAnchorControl({
            anchor_image_url : this.parameters.anchor_image_url,
            param_key_x : "x3",
            param_key_y : "y3",
            x : offX + quad.x3,
            y : offY + quad.y3,
            notifyDelegate : this } );


        this.listeners = {
            onMouseUp:    _.bind(this.onMouseUp, this),
            onTouchEnd:   _.bind(this.onTouchEnd, this),
            onTouchStart: _.bind(this.onTouchStart, this),
            onMouseDown:  _.bind(this.onMouseDown, this),
            onMouseMove:  _.bind(this.onMouseMove, this),
            onTouchMove:  _.bind(this.onTouchMove, this),
            onAnyTouchStart: _.bind(this.onAnyTouchStart, this),
            onAnyTouchEnd: _.bind(this.onAnyTouchEnd, this)
        };

        /* So we can detect clicks anywhere and show/hide anchors */

        $(document).bind( 'touchstart', this.listeners.onAnyTouchStart);
        $(document).bind( 'touchend', this.listeners.onAnyTouchEnd);

        /* So we can auto show/hide anchors as we enter zones */

         $(document).bind( "mousemove", this.listeners.onMouseMove);
         $(document).bind(  "touchmove", this.listeners.onTouchMove);

        /* So we can detect quad move */

        this.dragDiv.bind( 'touchstart', this.listeners.onTouchStart);
        this.dragDiv.bind(  'mousedown', this.listeners.onMouseDown);


        this.animateFadeTimer = null;
        this.animateShowTimer = null;
        this.fadeAnchors( 5000 );
   },

   onAnyTouchStart : function( ev ) {
        this.showAnchors();
   },

   onAnyTouchEnd : function( ev ) {
        setTimeout( _.bind(this.fadeAnchors, this, 5000 ), 2000 );
   },

   onTouchStart : function( ev ) {
       var x = ev.touches[0].pageX;
       var y = ev.touches[0].pageY;
       this._dragStart( x, y );
       ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
   },

   onMouseDown : function( ev ) {
      var x = ev.clientX;
       var y = ev.clientY;
       this._dragStart( x, y );
       ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
   },

   _dragStart : function( x, y ) {
       var cOffset = this.parameters.previewNode.offset();
       x -= cOffset.left;
       y -= cOffset.top;

       dragDivPos = this._getRelativeCoordinates( this.dragDiv );
       this.isDragging = true;
       this.divAnchorX = dragDivPos.x;
       this.divAnchorY = dragDivPos.y;
       this.dragAnchorX = x;
       this.dragAnchorY = y;

       this.dragZone = this._findZone( x, y );

       $(document).bind( 'touchend', this.listeners.onTouchEnd);
       $(document).bind( 'mouseup', this.listeners.onMouseUp);
   },

  _getRelativeCoordinates : function( eleNode ) {
      var cOffset = this.parameters.previewNode.offset();
      return {
          x : parseInt( eleNode.css( 'left' ) ) - cOffset.left,
          y : parseInt( eleNode.css( 'top' ) ) - cOffset.top
          }
  },

  onTouchMove : function( ev ) {
       var x = ev.touches[0].pageX;
       var y = ev.touches[0].pageY;
       this._dragMove( ev, x, y );
       ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
   },

   onMouseMove : function( ev ) {
       var x = ev.clientX;
       var y = ev.clientY;
       this._dragMove( ev, x, y );
       ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
   },

   _dragMove : function( ev, x, y ) {

       if (this.isDragging) {
           var cOffset = this.parameters.previewNode.offset();
           x -= cOffset.left;
           y -= cOffset.top;
           this._checkZoneChange( ev, x, y );
           this._updateDragDivAndAnchors(x,y);
       } else {
            var x0 = parseInt(this.dragDiv.css( 'left') );
            var y0 = parseInt(this.dragDiv.css( 'top' ) );
            var x1 = parseInt(this.dragDiv.css( 'width' ) ) + x0;
            var y1 = parseInt(this.dragDiv.css( 'height' )) + y0;
            if ( x >= x0 && x <= x1 && y >= y0 && y <= y1 ) {
               this.showAnchors();
            } else {
               this.fadeAnchors();
            }
       }
   },

    onTouchEnd : function( ev ) {
        var x = ev.changedTouches[0].pageX;
        var y = ev.changedTouches[0].pageY;
        this._dragEnd( x, y );
    },

    onMouseUp : function( ev ) {
        var x = ev.clientX;
        var y = ev.clientY;
        this._dragEnd( x, y );
    },

    _dragEnd : function( x, y ) {
        var cOffset = this.parameters.previewNode.offset();
        x -= cOffset.left;
        y -= cOffset.top;

        this.isDragging = false;
        $(document).unbind('touchend', this.listeners.onTouchEnd);
        $(document).unbind('mouseup', this.listeners.onMouseUp);
        this._updateDragDivAndAnchors(x,y);
        this.updateRenderParams();
    },

   _updateDragDivAndAnchors : function( x, y ) {
       var dx = x - this.dragAnchorX;
       var dy = y - this.dragAnchorY;

       var quad = this.parameters.quadrilateral;
       quad.offset_x = this.divAnchorX + dx;
       quad.offset_y = this.divAnchorY + dy;

       this._updateDragDivArea();
       this._updateAllAnchorPositions( quad.offset_x, quad.offset_y);
   },

   _updateAllAnchorPositions : function(x,y) {
       var cOffset = this.parameters.previewNode.offset();
       x += this.parameters.drag_border + cOffset.left;
       y += this.parameters.drag_border + cOffset.top;

       var quad = this.parameters.quadrilateral;
       this.anchorUL.setPosition( x + quad.x0, y + quad.y0 );
       this.anchorUR.setPosition( x + quad.x1, y + quad.y1 );
       this.anchorLR.setPosition( x + quad.x2, y + quad.y2 );
       this.anchorLL.setPosition( x + quad.x3, y + quad.y3 );
   },

   _updateDragDivArea : function() {
       var area = this._calcDragDivArea();

       var border = this.parameters.drag_border;
       this.dragDiv.css( 'left', (area.x - border) + "px" );
       this.dragDiv.css( 'top', (area.y - border) + "px" );
       this.dragDiv.css( 'width', (area.w  + border * 2) + "px" );
       this.dragDiv.css( 'height', (area.h + border * 2) + "px" );
   },

   /*
    * Method: _calcDragDivArea
    *
    * Return the area containing the quadrilateral
    */

   _calcDragDivArea : function() {
     var cOffset = this.parameters.previewNode.offset();

     var quad = this.parameters.quadrilateral;
     var area = this._getQuadArea( quad );

     area.x += quad.offset_x + cOffset.left;
     area.y += quad.offset_y + cOffset.top;
     return area;
   },


   _getQuadArea: function( quad ) {
       var minX = 99999;
       var minY = 99999;
       var maxX = -99999;
       var maxY = -99999;

       if ( minX > quad.x0 )  minX = quad.x0;
       if ( minX > quad.x1 )  minX = quad.x1;
       if ( minX > quad.x2 )  minX = quad.x2;
       if ( minX > quad.x3 )  minX = quad.x3;

       if ( maxX < quad.x0 )  maxX = quad.x0;
       if ( maxX < quad.x1 )  maxX = quad.x1;
       if ( maxX < quad.x2 )  maxX = quad.x2;
       if ( maxX < quad.x3 )  maxX = quad.x3;

       if ( minY > quad.y0 )  minY = quad.y0;
       if ( minY > quad.y1 )  minY = quad.y1;
       if ( minY > quad.y2 )  minY = quad.y2;
       if ( minY > quad.y3 )  minY = quad.y3;

       if ( maxY < quad.y0 )  maxY = quad.y0;
       if ( maxY < quad.y1 )  maxY = quad.y1;
       if ( maxY < quad.y2 )  maxY = quad.y2;
       if ( maxY < quad.y3 )  maxY = quad.y3;

       return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
   },

   _findZone : function( x, y ) {
       for( var z = 0; z < this.parameters.zones.length; z++ ) {
           var d = this.parameters.zones[z].destination;

           if ( x > d.x && x < d.x + d.w && y > d.y && y < d.y + d.h ) {
                return z;
            }
       }

       return -1;
   },


   _checkZoneChange : function( ev, x, y ) {
       var newZone = this._findZone( x, y );

       if ( newZone != this.dragZone && newZone >= 0 ) {
           var zone = this.parameters.zones[newZone];

           var qArea = this._getQuadArea( zone.quad );

           var offX = x - qArea.w / 2;
           var offY = y - qArea.h / 2;

           offX -= this.parameters.drag_border;
           offY -= this.parameters.drag_border;
           this.dragDiv.css( 'left', offX + "px" );
           this.dragDiv.css( 'top', offY + "px");

           /* Fix divAnchor to reflect new change of position */

           this.divAnchorX = offX;
           this.divAnchorY = offY;
           this.dragAnchorX = x;
           this.dragAnchorY = y;

           var quad = this.parameters.quadrilateral;
           quad.x0 = zone.quad.x0 - qArea.x;
           quad.x1 = zone.quad.x1 - qArea.x;
           quad.x2 = zone.quad.x2 - qArea.x;
           quad.x3 = zone.quad.x3 - qArea.x;

           quad.y0 = zone.quad.y0 - qArea.y;
           quad.y1 = zone.quad.y1 - qArea.y;
           quad.y2 = zone.quad.y2 - qArea.y;
           quad.y3 = zone.quad.y3 - qArea.y;

       }
       this.dragZone = newZone;
   },

   _findZone : function( x, y ) {
       for( var z = 0; z < this.parameters.zones.length; z++ ) {
           var d = this.parameters.zones[z].destination;

           if ( x > d.x && x < d.x + d.w && y > d.y && y < d.y + d.h ) {
                return z;
            }
       }

       return -1;
   },


    notifyAnchorMoved : function( params ) {
        var quad = this.parameters.quadrilateral;
        var cOffset = this.parameters.previewNode.offset();
        quad[params.x_key] = params.x - quad.offset_x - cOffset.left;
        quad[params.y_key] = params.y - quad.offset_y - cOffset.top;
        this._updateDragDivArea();
        this.updateRenderParams();
    },

    updateRenderParams : function() {
        var minX = 99999;
        var minY = 99999;
        var maxX = -99999;
        var maxY = -99999;

        quad = this.parameters.quadrilateral;
        if ( minX > quad.x0 )  minX = quad.x0;
        if ( minX > quad.x1 )  minX = quad.x1;
        if ( minX > quad.x2 )  minX = quad.x2;
        if ( minX > quad.x3 )  minX = quad.x3;

        if ( minY > quad.y0 )  minY = quad.y0;
        if ( minY > quad.y1 )  minY = quad.y1;
        if ( minY > quad.y2 )  minY = quad.y2;
        if ( minY > quad.y3 )  minY = quad.y3;

        quad.offset_x += minX;
        quad.offset_y += minY;

        quad.x0 -= minX;
        quad.x1 -= minX;
        quad.x2 -= minX;
        quad.x3 -= minX;

        quad.y0 -= minY;
        quad.y1 -= minY;
        quad.y2 -= minY;
        quad.y3 -= minY;

        var qPfx = this.parameters.quad_param_prefix;
        var mPfx = this.parameters.offset_param_prefix;

        var renderParams = r = {};
        r[ qPfx + "x0" ] = quad.x0;
        r[ qPfx + "x1" ] = quad.x1;
        r[ qPfx + "x2" ] = quad.x2;
        r[ qPfx + "x3" ] = quad.x3;

        r[ qPfx + "y0" ] = quad.y0;
        r[ qPfx + "y1" ] = quad.y1;
        r[ qPfx + "y2" ] = quad.y2;
        r[ qPfx + "y3" ] = quad.y3;

        r[ mPfx + "x" ] = quad.offset_x;
        r[ mPfx + "y" ] = quad.offset_y;

        if ( typeof this.parameters.notifyDelegate == 'object' && typeof this.parameters.notifyDelegate.notifyChanges == 'function' ) {
            this.parameters.notifyDelegate.notifyChanges( renderParams, true );
        }
    },


    fadeAnchors : function( initialDelay ) {
        if ( this.animateShowTimer != null )  {
            if ( this.animateFadeTimer == null ) {
              this.animateFadeTimer = setTimeout(_.bind(this._animateAnchorFade, this), 2000);
              clearTimeout( this.animateShowTimer );
              this.animateShowTimer = null;
            }
        }

        if ( this.animateFadeTimer == null ) {

            if ( typeof initialDelay == 'undefined' )
                 initialDelay = 2000;

            if ( this.anchorOpacity < 1.0 )
              initialDelay = 5;

            if ( this.anchorOpacity > 0.0 )
                 this.animateFadeTimer = setTimeout(_.bind(this._animateAnchorFade, this), initialDelay);
         }
    },

    showAnchors : function( initialDelay) {
        if ( this.animateFadeTimer != null )  {
            clearTimeout( this.animateFadeTimer );
            this.animateFadeTimer = null;
        }
        if ( this.animateShowTimer == null ) {
            if ( typeof initialDelay == 'undefined' ) {
              initialDelay = 10;
            }

            if ( this.anchorOpacity < 1.0 ) {

              this.animateShowTimer = setTimeout(_.bind(this._animateAnchorShow,this), initialDelay);
            }
        }
    },

    _animateAnchorFade : function() {
        this.anchorOpacity -= 0.05;
        this.animateFadeTimer = null;
        this.anchorUL.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorUR.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorLL.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorLR.imgNode.css( 'opacity',  this.anchorOpacity );

        if ( this.anchorOpacity > 0 ) {
            this.animateFadeTimer = setTimeout(_.bind(this._animateAnchorFade, this), 25);
        }
    },

    _animateAnchorShow : function() {
        this.anchorOpacity += 0.05;
        this.anchorUL.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorUR.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorLL.imgNode.css( 'opacity',  this.anchorOpacity );
        this.anchorLR.imgNode.css( 'opacity',  this.anchorOpacity );

        if ( this.anchorOpacity < 1 ) {
            this.animateShowTimer = setTimeout(_.bind(this._animateAnchorShow, this), 25);
        }
    }
});


