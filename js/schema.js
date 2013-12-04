var Schema = Class.extend({
	chain: [],
	errors: [],
	messages: [],
	parsed: {},
	config: {
		debug: 2	
	},
	
	getProp: function(o, f, d) {
		d = typeof d === 'undefined' ? false : d;
		return typeof o[f] !== 'undefined' ? o[f] : d;	
	},
	
	chainName: function() {
		var ctxt = this;
		return ctxt.chain.join('.');
	},
	
	error: function(e) {
		var ctxt = this;
		ctxt.errors.push(e);
		if (ctxt.config.debug >= 2) {
			console.log('ERROR: ' + e);
		}
	},
	
	message: function(m) {
		var ctxt = this;
		ctxt.messages.push(m);
		if (ctxt.config.debug >= 1) {
			console.log(m);
		}
	},
	
	
	/* BEGIN MOCKING */
	mockObject: function(o, name) {
		var ctxt = this;
		var obj = {};
		
		for (var p in o.members) {
			obj[p] = ctxt.mockField(o.members[p], p);
		}
		
		return obj;
	},
	
	mockInteger: function(o, name) {
		var ctxt = this;
		var obj = 12345;
		
		var min = o.min ? o.min : 1;
		var max = o.max ? o.max : 100;
		
		if (typeof o.mock == 'function') {
			obj = o.mock();
		} else {
			obj = Math.floor(Math.random() * (max -  min)) + min;
		}
		
		return obj;
	},
	
	mockString: function(o, name) {
		var ctxt = this;
		var obj = "MOCK STRING";
		
		var min = o.min ? o.min : 10;
		var max = o.max ? o.max : 30;
		
		if (typeof o.mock == 'function') {
			obj = o.mock();
		} else {
			var sa = [];
			for (var i = min; i <= max; i++) {
				var val = Math.ceil(Math.random() * 26) + 64;
				val += Math.random() < 0.5 ? 0 : 32;
				sa.push(String.fromCharCode(val));
				if (Math.random() < 0.1) {
					sa.push(' ');
				}
			}
			obj = sa.join('').trim();
		}
		
		return obj;
	},
	
	mockArray: function(o, name) {
		var ctxt = this;
		var obj = [];
		
		var min = o.min ? o.min : 1;
		var max = o.max ? o.max : 5;
		if (typeof o.mock == 'function') {
			obj = o.mock();
		} else {
			var l = Math.floor(Math.random() * (max - min)) + min;
			
			for (var i = 0; i <= l; i++) {
				obj.push(ctxt.mockField(o.elements, i));
			}
		}
		
		return obj;
	},
	
	mockField: function(field, name) {
		var ctxt = this;
		var obj = {};
		
		ctxt.chain.push(name);
		switch (field.type.trim().toLowerCase()) {
			case "object": obj = ctxt.mockObject(field, name); break;
			case "integer": obj = ctxt.mockInteger(field, name); break;
			case "string": obj = ctxt.mockString(field, name); break;
			case "array": obj = ctxt.mockArray(field, name); break;
			default: ctxt.error("Unsure of how to handle \"" + field.name + "\" of type \"" + field.type + "\"");
		}
		ctxt.chain.pop;
		
		return obj;
	},
	
	mock: function() {
		var ctxt = this;
		var obj = {};
		ctxt.chain = [];
		obj = ctxt.mockField(ctxt.parsed, ctxt.parsed.name ? ctxt.parsed.name : 'ROOT');
		ctxt.chain = [];
		return obj;
	},
	
	/* END MOCKING */
	
	
	/* BEGIN VALIDATING */
	validateObject: function(s, o, opts) {
		var ctxt = this;
		var valid = true;
		if (typeof o !== 'object' || typeof o.length !== 'undefined') {
			ctxt.error("Not an object: " + ctxt.chainName());
			valid = false;
		} else {
			for (var p in s.members) {
				if (typeof o[p] === 'undefined') {
					ctxt.error("Missing member in " + ctxt.chainName() + ': ' + p);
					console.log(o);
				} else {
					opts.name = p;
					valid = ctxt.validateField(s.members[p], o[p], opts);
					if (!valid) {
						return valid;
					}
				}
			}
		}
		
		if (valid) { ctxt.message(ctxt.chainName() + ' is an object'); }
		
		return valid;
	},
	
	validateString: function(s, o, opts) {
		var ctxt = this;
		var valid = typeof o === 'string';
		
		if (!valid) { ctxt.error("Invalid string in " + ctxt.chainName() + ".  Not a string"); }
		
		if (s.max !== false) {
			valid = valid && o.length <= s.max;
			if (!valid) { ctxt.error("Invalid string in " + ctxt.chainName() + ".  Max length = " + s.max + ', actual length = ' + o.length); }
		}
		
		if (s.min !== false) {
			valid = valid && o.length >= s.min;
			if (!valid) { ctxt.error("Invalid string in " + ctxt.chainName() + ".  Min length = " + s.min + ', actual length = ' + o.length); }
		}
		
		if (s.pattern !== false) {
			valid = valid && s.pattern.test(o);
			if (!valid) { ctxt.error("Invalid string in " + ctxt.chainName() + ".  Doesn't match pattern"); }
		}
		
		if (valid) { ctxt.message(ctxt.chainName() + ' is a string'); }
		
		return valid;
	},
	
	validateInteger: function(s, o, opts) {
		var ctxt = this;
		var valid = typeof o === 'number';
		valid = valid && /^-?\d+$/.test(o);
		if (!valid) { ctxt.error("Invalid integer in " + ctxt.chainName() + ".  Not an integer"); }
		
		if (s.max !== false) {
			valid = valid && o <= s.max;
			if (!valid) { ctxt.error("Invalid integer in " + ctxt.chainName() + ".  Max = " + s.max + ', actual = ' + o); }
		}
		
		if (s.min !== false) {
			valid = valid && o >= s.min;
			if (!valid) { ctxt.error("Invalid integer in " + ctxt.chainName() + ".  Min = " + s.min + ', actual = ' + o); }
		}
		
		if (valid) { ctxt.message(ctxt.chainName() + ' is an integer'); }
		
		return valid;
	},
	
	validateArray: function(s, o, opts) {
		var ctxt = this;
		var valid = typeof o === 'object' && typeof o.length !== 'undefined';
		
		if (!valid) { ctxt.error("Invalid array in " + ctxt.chainName()); }
		
		if (s.min !== false) {
			valid = valid && o.length >= s.min;
			if (!valid) { ctxt.error("Not enough elements in array " + ctxt.chainName() + ".  Count = " + o.length); }
		}
		
		if (s.max !== false) {
			valid = valid && o.length >= s.min;
			if (!valid) { ctxt.error("Not enough elements in array " + ctxt.chainName() + ".  Count = " + o.length); }
		}
		
		if (valid) {
			for (var i = 0; i < o.length; i++) {
				var aeo = $.extend({}, opts, {name: i});
				valid = valid && ctxt.validateField(s.elements, o[i], aeo);
			}
		}
		
		if (valid) { ctxt.message(ctxt.chainName() + ' is an array'); }
		
		return valid;
	},
	
	validateField: function(s, o, opts) {
		var ctxt = this;
		var valid = true;
		var fName = typeof opts.name !== 'undefined' ? opts.name : 'ROOT'
		ctxt.chain.push(fName);
		switch (s.type.trim().toLowerCase()) {
			case "object": valid = ctxt.validateObject(s, o, opts); break;
			case "integer": valid = ctxt.validateInteger(s, o, opts); break;
			case "string": valid = ctxt.validateString(s, o, opts); break;
			case "array": valid = ctxt.validateArray(s, o, opts); break;
			default: ctxt.error("Unsure of how to handle \"" + field.name + "\" of type \"" + field.type + "\"");
		}
		ctxt.chain.pop();
		return valid;
	},
	
	validate: function(o, opts) {
		var ctxt = this;
		opts = typeof opts !== 'undefined' ? opts : {};
		ctxt.errors = [];
		ctxt.messages = [];
		opts.name = ctxt.getProp(ctxt.parsed, "name", "ROOT")
		ctxt.chain = [];
		return ctxt.validateField(ctxt.parsed, o, opts);
	},
	/* END VALIDATING */

	
	/* BEGIN PARSING */
	parseObject: function(o) {
		var ctxt = this;
		o.members = ctxt.getProp(o, "members", false);
		var objName = ctxt.getProp(o, "name", false);
		if (o.members !== false) {
			ctxt.message(ctxt.chainName() + " (" + (objName ? objName : '') + "Object)");
			var nmo = {};
			for (var m in o.members) {
				nmo[m] = ctxt.parseField(o.members[m], m);
			}
			o.members = nmo;
		} else {
			ctxt.error("No members specified for \"" + o.name + "\"");
		}
		
		return o;
	},
	
	parseInteger: function(o) {
		var ctxt = this;
		var defaults = {
			name: false,
			min: false,
			max: false
		};
		
		ctxt.message(ctxt.chainName() + " (Integer)");
		o = $.extend({}, defaults, o);
		return o;
	},
	
	parseString: function(o) {
		var ctxt = this;
		var defaults = {
			name: false,
			min: false,
			max: false,
			pattern: false
		};
		
		ctxt.message(ctxt.chainName() + " (String)");
		
		o = $.extend({}, defaults, o);
		return o;
	},
	
	parseArray: function(o) {
		var ctxt = this;
		var defaults = {
			min: 1,
			max: false
		};
		
		
		
		o.elements = ctxt.getProp(o, "elements", false);
		var arName = ctxt.chain.pop() + '[]';

		if (o.elements !== false) {
			o.elements = ctxt.parseField(o.elements, arName);
		} else {
			ctxt.error("No elements specified for \"" + o.name + "\"");
		}
		ctxt.chain.push('');
		
		o = $.extend({}, defaults, o);
		return o;
	},
	
	parseField: function(field, fName) {
		var ctxt = this;
		
		var retVal = false;
		fName = typeof fName === 'undefined' ? 'MISSING' : fName;
		
		ctxt.chain.push(fName);
		
		if (typeof field === 'undefined') {
			console.log("Undefined passed to parseField()");
		} else {
			field.type = ctxt.getProp(field, 'type', false);
			field.name = ctxt.getProp(field, 'name', false);
			
			if (field.type !== false) {
				switch (field.type.trim().toLowerCase()) {
					case "object": field = ctxt.parseObject(field); break;
					case "integer": field = ctxt.parseInteger(field); break;
					case "string": field = ctxt.parseString(field); break;
					case "array": field = ctxt.parseArray(field); break;
					default: ctxt.error("Unsure of how to handle \"" + field.name + "\" of type \"" + field.type + "\"");
				}
			} else {
				ctxt.error("No type specified for \"" + field.name + "\"");
			}
			retVal = field;
		}
		ctxt.chain.pop();
		return retVal;
	},
	
	parseSchema: function(o) {
		var ctxt = this;
		ctxt.errors = [];
		ctxt.messages = [];
		ctxt.parsed = ctxt.parseField(o, ctxt.getProp(o, "name", "ROOT"));
		ctxt.chain = [];
	},
	
	/* END PARSING */
	
	
	/* BEGIN INITIALIZATION */
	loadSchema: function(url) {
		var ctxt = this;
		var schema = $.ajax({
			url: url,
			type: 'GET',
			async: false,
		}).responseText;
		
		schema = schema.replace(/^[^\{]+/, '');
		
		ctxt.parseSchema(eval('(' + schema + ')'));
	},
	
	constructor: function(o) {
		var ctxt = this;
		
		ctxt.config = $.extend({}, ctxt.config, o);
		
		if (typeof o.schema !== 'undefined') {
			ctxt.parseSchema(o.schema);
		} else {
			ctxt.loadSchema(o.url);
		}
	}
	
	/* END INITIALIZATION */
	
});