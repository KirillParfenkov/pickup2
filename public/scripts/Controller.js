(function($, exports){
	
	var mod = function(includes){
		if (includes) this.include(includes);
	}

	mod.fn = mod.prototype;

	mod.fn.proxy = function(func){
		return func.bind(this);
	}

	mod.fn.include = function(o){
		$.extend(this, o);
	}

	mod.fn.load = function(func){
		$(this.proxy(func));
	}

	mod.fn.unload = function(func){
		$(window).unload(this.proxy(func));
	}

	exports.Controller = mod;

})(jQuery, window);