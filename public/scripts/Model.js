(function(exports){
	Math.guid = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}).toUpperCase();
	};

	var Model = {
		inherited 	: function(){},
		created		: function(){},

		prototype	: {
			init : function(){},
		},

		create : function(){
			var object = Object.create(this);
			object.parent = this;
			object.prototype = object.fn = Object.create(this.prototype);

			object.created();
			this.inherited(object);

			return object;
		},

		init : function(){
			var instance = Object.create(this.prototype);

			instance.clazz = this;
			instance.init.apply(instance, arguments);

			return instance;
		},

		extend : function(o){
			var extended = o.extended;
			jQuery.extend(this, o);
			if (extended) extended(this);
			
			return this;
		},

		include : function(o){
			var included = o.included;
			jQuery.extend(this.prototype, o);
			if (included) included(this);
			
			return this;			
		}
	};

//========================================================

	Model.extend({
		find : function(id){
			return this.records[id].dup() || (function(){throw("Неизвестная запись")})();
		},

		findAll : function(){
			return jQuery.map(this.records, Function.prototype.call.bind(this.fn.dup) );
		},

		created : function(){
			this.records 	= {};
			this.attributes	= [];
		},

		populate : function(records){
			this.records = {};

			records.map(this.init, this).
				forEach( Function.prototype.call, this.fn.save );
		}
	});

//========================================================

	Model.include({
		newRecord : true,

		init : function(atts){
		
			if (atts) this.load(atts);
		},
		
		load : function(attributes){
			for (key in attributes){
				this[key] = attributes[key];
			}
		},

		create : function(){
			this.id = this.id || Math.guid();
			this.newRecord = false,
			this.clazz.records[this.id] = this.dup();
		},

		destroy : function(){
			delete this.clazz.records[this.id];	
		},

		update : function(){
			this.clazz.records[this.id] = this.dup();
		},

		save : function(){
			this.newRecord ? this.create() : this.update();
		},

		dup : function(){
			return Object.create(
						Object.getPrototypeOf(this), 
						this.attributes()
					);
		},

		attributes : function(){
			var result = {};
			this.clazz.attributes.forEach(function(attribute){
				result[attribute] = this[attribute];
			},this);
			result.id = this.id ;

			return result;
		},

		toJSON : function(){
			return this.attributes();
		}

	});

//========================================================

	Model.LocalStorage = {
		save : function(name){
			localStorage[name] = JSON.stringify( 
						Object.keys(this.records).map(function(key){
							return this.records[key]
						}, this) 
					);
		},
		load : function(name){
			this.populate(JSON.parse(localStorage[name]||"[]"))
		}
	}

//========================================================

	exports.Model  	= Model;
	exports.Person  = Model.create();
	Person.extend(Model.LocalStorage);
	Person.attributes = ["name", "age"];

})(window);