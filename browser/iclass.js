// JavaScriptMVC's Class plugin
// http://javascriptmvc.com/blog/?p=61
// based heavily on John Resig's Simple Class Inheritance
// http://ejohn.org/blog/simple-javascript-inheritance/
// Class is freely distributable under the terms of an MIT-style license.
// 1.0.1
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base IClass implementation (does nothing)
  
  IClass = function(){};
  IClass.init = function(){
	if (this.className) {
	  	var className = this.className.replace(/\w+/g,function(word){
			return word.charAt(0).toUpperCase()+word.substr(1).toLowerCase();
		}).replace(/_|-/g,'');
		window[className] = this;
		var i;
	}
  }
  // Create a new IClass that inherits from this class
  IClass.extend = function(className, klass, proto) {
    if(typeof className != 'string'){
        proto = klass;
        klass = className;
        className = null;
    }
    if(!proto){
        proto = klass;
        klass = null;
    }
    var _super_class = this;
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in proto) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof proto[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(proto[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, proto[name]) :
        proto[name];
    }
    // The dummy class constructor
    function IClass() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    // Populate our constructed prototype object
    IClass.prototype = prototype;
    IClass.prototype.IClass = IClass;
    IClass.prototype.superclass = _super_class;
    // Enforce the constructor to be what we expect
    IClass.constructor = IClass;
    // And make this class extendable
    
    for(var name in this){
        if(this.hasOwnProperty(name) && name != 'prototype'){
            IClass[name] = this[name];
        }
    }
    
    for (var name in klass) {
      IClass[name] = typeof klass[name] == "function" &&
        typeof IClass[name] == "function" && fnTest.test(klass[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super_class[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
            return ret;
          };
        })(name, klass[name]) :
        klass[name];
	};
    IClass.extend = arguments.callee;
    if(className) IClass.className = className;
    
    if(IClass.init) IClass.init(IClass);
    if(_super_class.extended) _super_class.extended(IClass) 
    
    return IClass;
  };
})();