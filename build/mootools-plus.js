/*
---

name: Plus

description: MooTools More Plus

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Plus

...
*/
MooTools.Plus = {
	'version': '0.1'
};


/*
---

name: BindInstances

description: Add ability to bind all instance methods to the current object. Previously this was a
	mutator but since it relies on the initialize mutator and that can be used by a lot of people.
	So I decided to simply make this a static method that one can call to bind the instances. Simply
	call this method in the class's initialize method before everything else to bind it.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - BindInstances

...
*/
Class.extend({
	/**
	 * Bind all instance methods of the provided object to itself.
	 *
	 * @param obj	{Object}	The object to bind.
	 * @returns {Object}	The provided object.
	 */
	bindInstances: function(bind) {
		var value;
		for(var key in bind) {
			value = bind[key];
			if((typeOf(value) === 'function') && (key !== '$caller')) {
				bind[key] = value.bind(bind);
			}
		}

		return bind;
	}
});


/*
---

name: Class.Mutators.Static

description: Mutator to allow the data given to it to be set to the class itself and not its
	prototype.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Class.Mutators.Static

...
*/
/**
 * @param data	{Mixed}		The data to be set.
 * @returns void
 */
Class.Mutators.Static = function(data) {
	Array.from(data).each(this.extend, this);
};


 /*
---

name: Class.Mutators.StoredInstances

description: Allow classes to stored instances that has been created. Note that because this
	contains static data and methods, any subclass will also need to include this if the parent
	class has it.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Class.Mutators.StoredInstances

...
*/
Class.Mutators.StoredInstances = function() {
	this.extend({
		/**
		 * @type {Object}	All the instances that has been stored.
		 */
		$instances: {},

		/**
		 * Get a stored instance.
		 *
		 * @param id	{String}	The identifier that the instance was stored by.
		 * @returns {Mixed}		The stored instance or null if it does not exists.
		 */
		retrieveInstance: function(id) {
			return [this.$instances[id]].pick();
		}
	}).implement({
		/**
		 * Get a stored instance. Note that this simply allow you to access the static version of
		 * this method on the instance itself.
		 *
		 * @param id	{String}	The identifier that the instance was stored by.
		 * @returns {Mixed}		The stored instance or null if it does not exists.
		 */
		retrieveInstance: function(id) {
			return this.$caller.$owner.retrieveInstance(id);
		},

		/**
		 * Store this instance. Note that this will NOT overwrite another instance if the provided
		 * id already exists.
		 *
		 * @param id	{String}	The identifier for this instance.
		 * @returns {Mixed}		Returns true if the instance was successfully stored. If the another
		 * 		instance was already stored with the provided id, that instance is returned.
		 */
		storeInstance: function(id) {
			var instance = this.retrieveInstance(id);
			if(instance) { return instance; }

			this.$caller.$owner.$instances[id] = this;
			return true;
		}
	});
};


/*
---

name: Function.Plus

description: Extends the Function native object to include useful methods to work with functions.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Function.Plus

...
*/
Function.implement({
	/**
	 * Curry the provided arguments.
	 *
	 * @param args	{Mixed}		The arguments to always pass to the function (must be an array if
	 * 		passing more than one argument).
	 * @param bind	{Mixed}		The object that the "this" of the function will refer to.
	 * @returns {Function}	The currified function.
	 */
	curry: function(args, bind) {
		var fn = this;
		var params = Array.from(args);

		return function() {
			var args = params.concat(Array.from(arguments));
			return fn.apply([bind, this].pick(), args);
		};
	}
});


/*
---

name: HtmlOptionsJS

description: Load configuration options from the HTML source.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Shortcuts
  - Function.Plus

provides:
  - HtmlOptionsJS

...
*/
/**
 * It is expected though that with the provided element, there exists another element that is the
 * container of all the configurations. All direct children of the element is considered to be an
 * option. The class of that child element determines the type of the configuration. The title
 * attribute is used for the key of the configuration option.
 *
 * Configuration Types:
 * 		boolean - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a Boolean. All values will be considered true unless it is the
 * 			string "false".
 * 		double - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a double.
 * 		eval - The innerText of the element will be passed to the function "eval" and the returned
 * 			value will be the value of the configuration. Be careful when using this.
 * 		event - The innerText of the element will be passed to the function "eval" and the returned
 * 			value will be set as an event. Be careful when using this.
 * 		html - The innerHTML of the element will be used as the value of the configuration. The
 * 			value is treated as a string.
 * 		integer - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as an integer.
 * 		string - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a string.
 *
 * 	Sample Code:
 * 		Below is a sample of how the HTML would look like
 * 		<div id="wrapper">
 * 			<div class="htmloptions" style="display: none;">
 * 				<div class="boolean" title="visible">false</div>
 * 				<div class="string" title="id">my_id</div>
 * 				<div class="integer" title="delay">5000</div>
 * 				<div class="double" title="delay">15.24</div>
 * 				<div class="eval" title="callback">my_funct</div>
 * 				<div class="event" title="load">loadObserver</div>
 * 				<div class="html" title="template"><div id="something"></div></div>
 * 			</div>
 * 			...
 * 		</div>
 */
var HtmlOptionsJS = new Class({
	Implements: [Events, Options],

	// ------------------------------------------------------------------------------------------ //

	/**
	 * The available options are:
	 * 		options_selector: (String) The selector for the wrapper element of the options. Note
	 * 			that this will only target the first item that matched this selector.
	 *
	 * @type {Object}	Various options.
	 */
	options: {
		options_selector: '.htmloptions'
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Load all the options from the source HTML and then from the provided options.
	 *
	 * @param wrapper	{Element}	The wrapper element.
	 * @param options	{Object}	Various other options to merge into our current list of options.
	 * @returns {HtmlOptionsJS}
	 */
	loadAllOptions: function(wrapper, options) {
		this.loadOptions(wrapper);
		this.setOptions(options);

		return this;
	},

	/**
	 * Load extra options.
	 *
	 * This method is here for the sake of subclasses inheriting from it via extends. This allow
	 * other classes to provide extra functionalities for loading configuration from the source.
	 *
	 * @param options	{Object}	The options object.
	 * @param element	{Element}	The element holding the configuration data.
	 * @param type		{String}	The source type.
	 * @param key		{String}	The configuration key.
	 * @returns {Boolean}	Returns true if the configuration has been set and the default actions
	 * 		does not need to be executed. Returns false if the default actions should be taken.
	 */
	loadExtraOptions: function(options, element, type, key) { return false; },

	/**
	 * Load the options from the source HTML.
	 *
	 * @param wrapper	{Element}	The wrapper element.
	 * @returns {HtmlOptionsJS}
	 */
	loadOptions: function(wrapper) {
		var config_wrapper = wrapper.getElement(this.options.options_selector);
		if(!config_wrapper) { return this; }

		config_wrapper.hide();
		config_wrapper.getChildren().each(this.setOption.curry(this.options, this));

		return this;
	},

	/**
	 * Set the data of the provided element to the provided option.
	 *
	 * @param options	{Object}	The options object.
	 * @param element	{Element}	The element containing the configuration data to set.
	 * @returns {HtmlOptionsJS}
	 */
	setOption: function(options, element) {
		var type = element.get('class');
		var key = element.get('title');
		var data = element.get(type === 'html' ? 'html' : 'text');

		// Let subclasses have priority
		if(this.loadExtraOptions(options, element, type, key)) { return this; }

		// Onto the default actions
		switch(type) {
			case 'boolean': options[key] = data !== 'false'; break;
			case 'double': options[key] = data.toFloat(); break;
			case 'eval': options[key] = eval(data); break;
			case 'event': this.addEvent(key, eval(data)); break;
			case 'integer': options[key] = data.toInt(); break;
			case 'html': case 'string': options[key] = data; break;
			default: break; // Nothing to do for unsupported type
		}

		return this;
	}
});


/*
---

name: Element.Plus

description: Extends the Element native object to include useful methods to work with elements.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Elements.From

provides:
  - Element.Plus

...
*/
Element.implement({
	/**
	 * Get the height of this element minus the padding and border.
	 *
	 * @returns {int}
	 */
	getTrueHeight: function() {
		var old_overflow = this.getStyle('overflow');
		this.setStyle('overflow', 'hidden');

		var height = this.getHeight() -
			this.getStyle('padding-top').toInt() -
			this.getStyle('padding-bottom').toInt() -
			this.getStyle('border-top-width').toInt() -
			this.getStyle('border-bottom-width').toInt();

		this.setStyle('overflow', old_overflow);
		return height;
	},

	/**
	 * Get the width of this element minus the padding and border.
	 *
	 * @returns {int}
	 */
	getTrueWidth: function() {
		var old_overflow = this.getStyle('overflow');
		this.setStyle('overflow', 'hidden');

		var width = this.getWidth() -
			this.getStyle('padding-left').toInt() -
			this.getStyle('padding-right').toInt() -
			this.getStyle('border-left-width').toInt() -
			this.getStyle('border-right-width').toInt();

		this.setStyle('overflow', old_overflow);
		return width;
	},

	/**
	 * Replace this element using the provided HTML.
	 *
	 * @param html	{String}	The HTML to replace this element by.
	 * @returns {Element}
	 */
	replacesWith: function(html) {
		var elements = Elements.from(html);
		var first_element = elements.shift();

		// Replace this element with the first element from the list
		first_element.replaces(this);

		// Reverse the remaining elements and insert after the previous element
		elements.reverse().invoke('inject', first_element, 'after');

		return this;
	},

	/**
	 * Update the inner HTML of the element and evaluate any scripts within the HTML.
	 *
	 * @param html	{Mixed}		The HTML to update the element with. This will be converted to a
	 * 		String using toString if it exists, if not, it will be forcefully made a string.
	 * @returns {Element}
	 */
	update: function(html) {
		var processed = html.toString ? html.toString() : ('' + html);
		this.set('html', processed);
		processed.stripScripts(true);

		return this;
	}
});

// ---------------------------------------------------------------------------------------------- //

(function() {
	/**
	 * @type {int}	Counter for generating IDs.
	 */
	var id_counter = 1;
	Element.Properties.id = {
		/**
		 * Get the identifier of this element or create one and set it to the element then return
		 * it.
		 *
		 * @returns {String}
		 */
		get: function() {
			var id = this.id;
			if(id.length < 1) {
				do { id = 'anonymous_id_' + id_counter++; }
				while(document.id(id));

				this.set('id', id);
			}

			return id;
		}
	};
})();


/*
---

name: Element.Delegation.Plus

description: Separting the event type and the selector out to make code a little cleaner.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Delegation
  - Function.Plus

provides:
  - Element.Delegation.Plus

...
*/
(function() {
	Element.implement({
		/**
		 * Simply a wrapper around the element delegation.
		 *
		 * @param type			{String}	The type of the event.
		 * @param selectors		{String}	The selectors to specify the children elements the event
		 * 		should be relayed to.
		 * @param fn			{Function}	The handler of the event.
		 * @returns {Element}
		 */
		delegateEvent: function(type, selectors, fn) {
			type = type.toLowerCase();
			if(!Browser.ie) {
				// At a point in time, MooTools didn't have support for the focusin and focusout
				// event. Now that it does and it sticking to the event being named focus and blur,
				// we'll need to make the name to make our code backwards compatible.
				switch(type) {
					case 'focusin': type = 'focus'; break;
					case 'focusout': type = 'blur'; break;
				}
			}

			return this.addEvent(type + ':relay(' + selectors + ')', fn);
		}
	});
})();


/*
---

name: NamedChainJS

description: Chaining of methods with names.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - BindInstances
  - Function.Plus

provides:
  - NamedChainJS

...
*/
var NamedChainJS = new Class({
	/**
	 * @type {Array}	The list of functions to run.
	 */
	$fns: [],

	/**
	 * @type {Array}	The keys for each function.
	 */
	$keys: [],

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @class {NamedChainJS}
	 */
	initialize: function() {
		Class.bindInstances(this);
		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Insert the provided function at the end of the chain.
	 *
	 * @param key	{String}	The key for the provided function.
	 * @param fn	{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	append: function(key, fn) {
		return this.insertAt(this.$fns.length, key, fn);
	},

	/**
	 * Clear the chain.
	 *
	 * @returns {NamedChainJS}
	 */
	clear: function() {
		this.$fns = [];
		this.$keys = [];

		return this;
	},

	/**
	 * Insert the provided function after a certain function.
	 *
	 * Note that if the provided key does not exist, then the function will be inserted at the end
	 * of the array.
	 *
	 * @param after		{String}	The key of the function that the provided function should be
	 * 		added after.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertAfter: function(after, key, fn) {
		var index = this.$keys.indexOf(after);
		if(index === -1) { index = this.$keys.length; }
		else { ++index; }

		return this.insertAt(index, key, fn);
	},

	/**
	 * Insert the provided function before a certain function.
	 *
	 * Note that if the provided key does not exist, then the function will be inserted at the begin
	 * 		of the array.
	 *
	 * @param before	{String}	The key of the function that the provided function should be
	 * 		added before.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertBefore: function(before, key, fn) {
		var index = this.$keys.indexOf(before);
		if(index === -1) { index = 0; }

		return this.insertAt(index, key, fn);
	},

	/**
	 * Insert the provided function at the provided index.
	 *
	 * @param index		{int}		The index of where the function should be inserted at.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertAt: function(index, key, fn) {
		this.$keys.splice(index, 0, key);
		this.$fns.splice(index, 0, fn);
		return this;
	},

	/**
	 * Insert the provided function at the begining of the chain.
	 *
	 * @param key	{String}	The key for the provided function.
	 * @param fn	{Function}	The function to add to the chain.
	 * @param args	{Mixed}		Any extra arguments to be set to the function. If there is more than
	 * 		one argument, it should be set as an array.
	 * @returns {NamedChainJS}
	 */
	prepend: function(key, fn) {
		return this.insertAt(0, key, fn);
	},

	/**
	 * Remove the provided chain item.
	 *
	 * @param key	{String}	The key for the function.
	 * @returns {NamedChainJS}
	 */
	remove: function(key) {
		var index = this.$keys.indexOf(key);
		if(index !== -1) {
			this.$keys.splice(index, 1);
			this.$fns.splice(index, 1);
		}

		return this;
	},

	/**
	 * Pop the function off the top of the chain and run it.
	 *
	 * @returns {NamedChainJS}
	 */
	run: function() {
		if(this.$fns.length > 0) {
			this.$keys.shift();
			this.$fns.shift().call(this);
		}

		return this;
	}
});


/*
---

name: ResponsesJS

description: Handles JSON responses from the server with some preset callbacks.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - BindInstances
  - Element.Plus

provides:
  - ResponsesJS

...
*/
/**
 * The expected result from the server should be a JSON array where each item is an object with the
 * at a minimum the key "type". That type specifies the action to take. Refer to the various
 * response handler functions for how the response for each item would look like. Below is how the
 * entire response should look like:
 * 	[
 * 		{
 * 			type: 'the type',
 * 			any: 'extra',
 * 			data: 'goes',
 * 			here: '.'
 * 		},
 * 		...
 * 	]
 *
 * Note that with this, if another request is made before the current one is finished, this will
 * cancel the previous one.
 *
 * Events:
 * 		finishProcessing: Fired when all the responses has been processed.
 * 		processItem: Fired for each response received from the server.
 * 		startProcessing: Fired before the responses are to be processed.
 */
var ResponsesJS = new Class({
	Extends: Request.JSON,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * The options are:
	 * 		onFinishProcessing: (Function) The event "finishProcessing".
	 * 		onProcessItem: (Function) The event "processItem".
	 * 		onStartProcessing: (Function) The event "startProcessing".
	 *
	 * 		change_cursor: (Boolean) Whether or not the change the cursor upon the request and
	 * 			restore it when done. Defaults to false.
	 * 		extra_data: (Object) Any extra data that the user wants the handler to have when it
	 * 			parses the response. Note that this will be set to null once all the parsing is
	 * 			completed.
	 *
	 * @type {Object}	Various options.
	 */
	options: {
		/*
			// response: The individual response from the server.
			// responses: All the responses from the server.
			// responsesjs: The ResponsesJS instance that made the request.

			onFinishProcessing: function(responsesjs, responses) {},
			onProcessItem: function(responsesjs, response) {},
			onStartProcessing: function(responsesjs, responses) {},
		*/

		change_cursor:	false,
		extra_data:		null
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param options	{Object}	Optional. Refer to the options property.
	 * @class {ResponsesJS}
	 */
	initialize: function(options) {
		Class.bindInstances(this);

		this.parent(options);
		this.options.link = options && options.link ? options.link : 'cancel';
		this.addEvent('success', this.handleResponse, true);
		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Response handler for "alert". Alerts a message to the user.
	 * 		{
	 * 			type: 'alert',
	 * 			message: 'Your message here'
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	alertResponse: function(response) {
		window.alert(response.message);
		return this;
	},

	/**
	 * Response handler for "callback". Run the callback specified via "addHandler" using the
	 * provided parameters.
	 * 		{
	 * 			type: 'callback',
	 * 			key: 'key used in addHandler to set callback',
	 * 			parameters: ['your', 'various', 'parameters']
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	callbackResponse: function(response) {
		this.fireEvent(this.getHandlerName(response.key), Array.from(response.parameters));
		return this;
	},

	/**
	 * Response handler for "element_replace". Replaces the element with the provided identifier
	 * using the provided HTML. Note that this will evaluate any included JavaScript within the
	 * script tag after the element has been replaced.
	 * 		{
	 * 			type: 'element_replace',
	 * 			element_id: 'id of element to replace',
	 * 			html: '<p>The HTML to replace the element with.</p>'
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	elementReplaceResponse: function(response) {
		document.id(response.element_id).replacesWith(response.html);
		response.html.stripScripts(true);
		return this;
	},

	/**
	 * Response handler for "element_update". Updates the innerHTML of the element with the provided
	 * identifier using the provided HTML. Note that this will evaluate any included JavaScript
	 * within the script tag after the element has been updated.
	 * 		{
	 * 			type: 'element_update',
	 * 			element_id: 'id of element to update',
	 * 			html: '<p>The updated HTML</p>'
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	elementUpdateResponse: function(response) {
		document.id(response.element_id).update(response.html);
		return this;
	},

	/**
	 * Response handler for "function_call". Called the provided function using the provided scope
	 * and parameters. Note that using this is highly discouraged and it should only be used if the
	 * "callback" type cannot be used.
	 * 		{
	 * 			type: 'function_call',
	 * 			function_name: 'name of the function',
	 * 			scope: {the: 'scope', of: 'the', function_call: '.'},
	 * 			parameters: ['your', 'various', 'parameters']
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	functionCallResponse: function(response) {
		var fn = eval(response.fn);
		var scope = eval(response.scope);
		fn.apply(scope, Array.from(response.parameters));

		return this;
	},

	/**
	 * Response handler for "redirect". Redirect the user to a different page.
	 * 		{
	 * 			type: 'redirect',
	 * 			url: 'url_to_redirect_user'
	 * 		}
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	redirectResponse: function(response) {
		// Because window.location doesn't always work
		var form = new Element('form', {
			action: item.url,
			method: 'post'
		});

		form.inject(document.body);
		form.submit();
		return this;
	},

	/**
	 * Response handler for "reload". Reload the current page.
	 * 		{ type: 'reload' }
	 *
	 * @param response	{Object}	The response from the server.
	 * @returns {ResponsesJS}
	 */
	reloadResponse: function(response) {
		window.location.reload();
		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Add a custom handler for the response that will be taken care of by this class.
	 *
	 * @param name	{String}	The custom handler's name.
	 * @param fn	{Function}	The custom handler.
	 * @returns {ResponsesJS}
	 */
	addHandler: function(name, fn) {
		this.addEvent(this.getHandlerName(name), fn);
		return this;
	},

	/**
	 * Continue running the chain stored in extra data.
	 *
	 * @returns {ResponsesJS}
	 */
	continueChain: function() {
		if(this.options.extra_data && instanceOf(this.options.extra_data.chain, NamedChainJS)) {
			this.options.extra_data.chain.run();
		}

		return this;
	},

	/**
	 * Get a unique identifier for the provided handler name.
	 *
	 * @param name	{String}	The custom handler's name.
	 * @returns {String}
	 */
	getHandlerName: function(name) {
		return 'responsesjs_custom_handler_' + name;
	},

	/**
	 * Handles the response from the server.
	 *
	 * @param response	{Object}	The response.
	 * @returns {ResponsesJS}
	 */
	handleResponse: function(responses) {
		if(this.options.change_cursor && document.body) {
			document.body.setStyle('cursor', 'auto');
		}

		if(!responses) {
			this.options.extra_data = null;
			this.failure();
			return this;
		}

		this.fireEvent('startProcessing', [this, responses]);
		responses.each(function(item) {
			// For the sake of performance
			switch(item.type) {
				case 'alert': this.alertResponse(item); break;
				case 'callback': this.callbackResponse(item); break;
				case 'element_replace': this.elementReplaceResponse(item); break;
				case 'element_update': this.elementUpdateResponse(item); break;
				case 'function_call': this.functionCallResponse(item); break;
				case 'redirect': this.redirectResponse(item); break;
				case 'reload': this.reloadResponse(item); break;
				default: break;
			}

			this.fireEvent('processItem', [this, item]);
		}, this);
		this.fireEvent('finishProcessing', [this, responses]);

		this.options.extra_data = null;
		return this;
	},

	/**
	 * Make the request.
	 *
	 * @param options	{Object}	Optional. The options for the send Request. Will also accept
	 * 		data as a query string for compatibility reasons.
	 * @returns {ResponsesJS}
	 */
	send: function(options) {
		if(options && options.extra_data) { this.options.extra_data = options.extra_data; }
		if(this.options.change_cursor && document.body) {
			document.body.setStyle('cursor', 'progress');
		}

		return this.parent(options);
	}
});


/*
---

script: AutoComplete.js

name: AutoCompleteJS

description: Auto complete.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Position
  - More/Element.Shortcuts
  - Plus/BindInstances
  - Plus/Class.Mutators.Static
  - Plus/Class.Mutators.StoredInstances
  - Plus/Element.Delegation.Plus
  - Plus/Element.Plus
  - Plus/Function.Plus
  - Plus/NamedChainJS
  - Plus/ResponsesJS

provides: [AutoCompleteJS]

...
*/
/**
 * Since this allows you to use one instance on multiple input fields, some settings will need to be
 * stored on the input field as data attributes. All of the fields are optional however. They are:
 * 		data-hidden-field: The ID of the hidden input field where the value should be set. If this
 * 			is provided, then the input field that triggered the suggestion will get the display
 * 			text.
 *
 * Events:
 * 		hide: Fired when the auto complete is to be hidden.
 * 		postShow: Fired when the auto complete is shown.
 * 		preShow: Fired when the auto complete layer is to be shown.
 * 		selection: Fired when a suggestion is selected.
 */
var AutoCompleteJS = new Class({
	Implements: [Events, Options],
	StoredInstances: true,
	Static: {
		Chain: {
			/**
			 * The chain of actions for the method hide.
			 * 		fire_event: The chain item that fires the event hide.
			 * 		render: The chain item that hides the auto complete.
			 */
			hide: {
				fire_event: 'AutoCompleteJS.hide:fire_event',
				render: 'AutoCompleteJS.hide:render'
			},

			/**
			 * The chain of actions for the method show.
			 * 		fire_event: The chain item that fires the event preShow.
			 * 		request: The chain item that retrieves the suggestions.
			 * 		render: The chain item that shows the auto complete and fires the event
			 * 			postShow.
			 */
			show: {
				fire_event: 'AutoCompleteJS.show:fire_event',
				request: 'AutoCompleteJS.show:request',
				render: 'AutoCompleteJS.show:render'
			},

			/**
			 * The chain of actions for the method useSelected.
			 * 		fire_event: The chain item that fires the event selection.
			 * 		render: The chain item that highlights the selected item.
			 */
			useSelected: {
				fire_event: 'AutoCompleteJS.useSelected:fire_event',
				render: 'AutoCompleteJS.useSelected:render'
			}
		},

		/**
		 * INDEX: The index of the suggestion within the $suggestions array.
		 * PREVIOUS: The previous value of the input field.
		 */
		Constants: {
			INDEX: 'AutoCompleteJS.Constants.INDEX',
			PREVIOUS: 'AutoCompleteJS.Constants.PREVIOUS'
		},

		/**
		 * Get the instanced stored at the provided name or create a new one and store it there
		 * using the provided options.
		 *
		 * @param name		{String}			A unique name for the instance.
		 * @param server	{String|Function}	Refer to the server property. Optional if the
		 * 		instance already exists.
		 * @param options	{Object}			Refer to the options property. Optional.
		 * @returns {AutoCompleteJS}
		 */
		singleton: function(name, server, options) {
			var result = this.retrieveInstance(name);
			if(!result) {
				result = new AutoCompleteJS(server, options);
				result.storeInstance(name);
			}

			return result;
		}
	},

	/**
	 * The options are:
	 * 		onHide: (Function) Event handler for the event hide.
	 * 		onPostShow: (Function) Event handler for the event postShow.
	 * 		onPreShow: (Function) Event handler for the event preShow.
	 * 		onSelection: (Function) Event handler for the event selection.
	 *
	 * 		min_length: (int) The minimum number of characters before suggestions are fetched.
	 * 		query: (String) The name of the parameter to be sent if the server (if it is a string)
	 * 			that contains the user's input.
	 * 		extra_data: (Object) Any extra data to send along with the request to the server.
	 *
	 * @type {Object}	Various options.
	 */
	options: {
		/*
			// autocompletejs: This AutoCompleteJS instance.
			// chain: The chain of actions.
			// hidden_field: The hidden input field to store the event. Can be null.
			// suggestion: The selected suggestion. Object with property value and display.

			onHide: function(autocompletejs, chain) {},
			onPostShow: function(autocompletejs, chain) {},
			onPreShow: function(autocompletejs, chain) {},
			onSuggestion: function(autocompletejs, chain, suggestion, hidden_field) {},
		*/

		min_length:		3,
		query:			'query',
		extra_data:		{}
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {ResponsesJS}	Handles all AJAX requests.
	 */
	$responses: null,

	/**
	 * @type {Array}	An array of objects containing all the possible suggestions. Each suggestion
	 * 		is an object containing the property value and display.
	 */
	$suggestions: [],

	/**
	 * @type {Boolean}	Whether or not the auto complete is currently visible.
	 */
	$visible: false,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {String|Function}	If it is a string, it must be the URL to the server that will
	 * 		receive the user's input and must return the possible suggestions (Refer to the method
	 * 		"handleResponse" for what the response should look like). If it is a function, the
	 * 		signature of the function is: function(autocompletejs) {}, where autocompletejs is this
	 * 		instance. You can get the query and the like from the input property.
	 */
	server: null,

	/**
	 * @type {Element}	The element that is this AutoCompleteJS instance in the DOM.
	 */
	element: null,

	/**
	 * References includes the following:
	 * 		loading: (Element) The element that has the loading message/image.
	 * 		suggestions: (Element) The wrapper element of the suggestions.
	 *
	 * @type {Object}	References to other elements within the auto complete.
	 */
	elements: null,

	/**
	 * @type {Element}	The element that provided the input for the suggestions.
	 */
	input: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param server	{String|Function}	Refer to the server property.
	 * @param options	{Object}			Refer to the options property. Optional.
	 * @class {AutoCompleteJS}
	 */
	initialize: function(server, options) {
		Class.bindInstances(this);
		this.setOptions(options);
		this.server = server;
		this.$responses = new ResponsesJS();
		this.$responses.addEvent('processItem', this.handleResponse)
			.addEvent('finishProcessing', this.$responses.continueChain);

		return this.build().attachInternal();
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Event handler for bluring out of the input field.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onBlur: function(event, element) {
		return this.hide();
	},

	/**
	 * Event handler for clicking on a suggestion..
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onClick: function(event, element) {
		event.preventDefault();
		return this.setSelection(element.retrieve(AutoCompleteJS.Constants.INDEX));
	},

	/**
	 * Event handler for focusing on an input field.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onFocus: function(event, element) {
		// Turn off the browser's auto complete
		element.set('autocomplete', 'false');
		return this;
	},

	/**
	 * Event handler for a key down on the input field.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onKeyDown: function(event, element) {
		// Prevent the enter and esc key but let the tab key selects and continue its behavior
		if((event.key === 'enter') || (event.key === 'esc')) { event.preventDefault(); }
		else if(event.key === 'tab') { this.useSelected(); }

		return this;
	},

	/**
	 * Event handler for a key up on the input field.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onKeyUp: function(event, element) {
		this.input = element;
		switch(event.key) {
			case 'enter':				// This key selects
				this.useSelected();
				break;
			case 'esc':					// This key terminates
				this.hide();
				break;
			case 'down': case 'up':		// These keys change selections
				var index = this.elements.suggestions.getElement('.suggestion.selected')
					.retrieve(AutoCompleteJS.Constants.INDEX);

				if((index > 0) && (event.key === 'up')) { --index; }
				else if((index < (this.$suggestions.length - 1)) &&
						(event.key === 'down')) { ++index; }

				this.setSelection(index);
				break;
			case 'left': case 'right':	// Ignore these keys
				break;
			default:					// Check all others
				if(this.input.get('value').length >= this.options.min_length) { this.show(); }
				else { this.hide(); }

				break;
		}

		return this;
	},

	/**
	 * Event handler for a mouse over event on a suggestion.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {AutoCompleteJS}
	 */
	onMouseOver: function(event, element) {
		var index = element.retrieve(AutoCompleteJS.Constants.INDEX);
		return this.setSelection(index);
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Attach this instance to input fields that matched the provided selector.
	 *
	 * @param selector	{String}	The CSS selector for the elements that should have this auto
	 * 		complete instance.
	 * @returns {AutoCompleteJS}
	 */
	attach: function(selector) {
		document.id(document.body).delegateEvent('focus', selector, this.onFocus)
			.delegateEvent('blur', selector, this.onBlur)
			.delegateEvent('keydown', selector, this.onKeyDown)
			.delegateEvent('keyup', selector, this.onKeyUp);

		return this;
	},

	/**
	 * Attach all the necessary events internally for the auto complete.
	 *
	 * @returns {AutoCompleteJS}
	 */
	attachInternal: function() {
		this.element.delegateEvent('click', '.suggestion', this.onClick)
			.delegateEvent('mouseover', '.suggestion', this.onMouseOver);

		return this;
	},

	/**
	 * Create the wrapper element for the auto complete.
	 *
	 * @returns {AutoCompleteJS}
	 */
	build: function() {
		this.elements = {
			loading: new Element('div.loading'),
			suggestions: new Element('div.suggestions')
		};

		this.element = new Element('div.autocompletejs').adopt(
			this.elements.loading, this.elements.suggestions
		).hide().inject(document.body);

		return this;
	},

	/**
	 * Wrap the provided text.
	 *
	 * @param display	{String}	The display text.
	 * @returns {String}	The display text after processing.
	 */
	getDisplayText: function(display) {
		return display.replace(
			new RegExp('(' + this.input.get('value') + ')', 'gi'),
			'<span class="provided">$1</span>'
		);
	},

	/**
	 * Handles the response from the server. The response is expected to be similar to the
	 * following:
	 * 		{
	 * 			type: 'autocompletejs',
	 * 			data: [
	 * 				{ value: "value1", display: "Friendly display 1" },
	 * 				...
	 * 			]
	 * 		}
	 *
	 * @param responsesjs	{ResponsesJS}	The request object.
	 * @param response		{Object}		The response to process.
	 * @returns {AutoCompleteJS}
	 */
	handleResponse: function(responsesjs, response) {
		switch(response.type) {
			case 'AutoCompleteJS:update_suggestions': this.$suggestions = response.data; break;
			default: break;
		}

		return this;
	},

	/**
	 * Hide the auto complete.
	 *
	 * @returns {AutoCompleteJS}
	 */
	hide: function() {
		var chain = new NamedChainJS();

		chain.append(AutoCompleteJS.Chain.hide.fire_event, this.__hideFireEvent.curry(chain))
			.append(AutoCompleteJS.Chain.hide.render, this.__hideRender.curry(chain))
			.run();

		return this;
	}, __hideFireEvent: function(chain) {
		this.fireEvent('hide', [this, chain]);
		chain.run();
	}, __hideRender: function(chain) {
		this.$visible = false;
		this.element.hide();
		chain.run();
	},

	/**
	 * Render the suggestions.
	 *
	 * @returns {AutoCompleteJS}
	 */
	renderSuggestions: function() {
		// If there are no suggestions, hide
		if(!this.$suggestions.length) { return this.hide(); }

		// Update the suggestions
		this.elements.suggestions.set('html', '');
		this.$suggestions.each(function(item, index) {
			new Element('div.suggestion').store(AutoCompleteJS.Constants.INDEX, index)
				.update(this.getDisplayText(item.display)).inject(this.elements.suggestions);
		}, this);

		// Make the first item the selected
		this.elements.suggestions.getElement('.suggestion').addClass('selected');
		return this;
	},

	/**
	 * Set the selection.
	 *
	 * @param index		{int}	The index of the selection to set.
	 * @returns {AutoCompleteJS}
	 */
	setSelection: function(index) {
		var suggestions = this.elements.suggestions.getElements('.suggestion');
		for(var i = 0, l = suggestions.length; i < l; ++i) {
			if(i === index) { suggestions[i].addClass('selected'); }
			else { suggestions[i].removeClass('selected'); }
		}

		// If none has been selected, select the first one
		if(!this.elements.suggestions.getElement('.suggestion.selected')) {
			this.elements.suggestions.getElement('.suggestion').addClass('selected');
		}

		return this;
	},

	/**
	 * Show the suggestions for the current input.
	 *
	 * @returns {AutoCompleteJS}
	 */
	show: function() {
		// If this is already visible and the value hasn't changed, no need to do anything
		if(!this.$visible ||
		   (this.input.get('value') !== this.input.retrieve(AutoCompleteJS.Constants.PREVIOUS))) {
			var chain = new NamedChainJS();

			chain.append(AutoCompleteJS.Chain.show.fire_event, this.__showFireEvent.curry(chain))
				.append(AutoCompleteJS.Chain.show.request, this.__showRequest.curry(chain))
				.append(AutoCompleteJS.Chain.show.render, this.__showRender.curry(chain))
				.run();
		}

		return this;
	}, __showFireEvent: function(chain) {
		this.fireEvent('preShow', [this, chain]);

		this.elements.loading.show();
		this.elements.suggestions.hide();
		this.element.show();

		this.element.position({
			relativeTo: this.input,
			edge: 'upperLeft',
			position: 'bottomLeft'
		});

		chain.run();
	}, __showRequest: function(chain) {
		if(typeOf(this.server) === 'function') {
			this.$suggestions = this.server(this);
			chain.run();
		} else {
			var data = Object.append({}, this.options.extra_data);
			data[this.options.query] = this.input.get('value');

			this.$responses.send({
				method: 'get',
				url: this.server,
				extra_data: { chain: chain },
				data: data
			});
		}
	}, __showRender: function(chain) {
		this.input.store(AutoCompleteJS.Constants.PREVIOUS, this.input.get('value'));
		this.renderSuggestions();

		this.elements.loading.hide();
		this.elements.suggestions.show();

		this.$visible = true;
		this.fireEvent('postShow', [this, chain]);
		chain.run();
	},

	/**
	 * Use the currently selected value.
	 *
	 * @returns {AutoCompleteJS}
	 */
	useSelected: function() {
		var chain = new NamedChainJS();
		var hidden_field = document.id(this.input.get('data-hidden-field'));
		var index = this.elements.suggestions.getElement('.suggestion.selected')
			.retrieve(AutoCompleteJS.Constants.INDEX);

		chain.append(
			AutoCompleteJS.Chain.useSelected.fire_event,
			this.__useSelectedFireEvent.curry([chain, this.$suggestions[index], hidden_field])
		).append(
			AutoCompleteJS.Chain.useSelected.render,
			this.__useSelectedRender.curry([chain, this.$suggestions[index], hidden_field])
		).run();

		return this;
	}, __useSelectedFireEvent: function(chain, suggestion, hidden) {
		this.fireEvent('selection', [this, chain, suggestion, hidden]);
		chain.run();
	}, __useSelectedRender: function(chain, suggestion, hidden) {
		if(hidden) {
			hidden.set('value', suggestion.value);
			this.input.set('value', suggestion.display);
		} else {
			this.input.set('value', suggestion.value);
		}

		this.hide();
		chain.run();
	}
});


/*
---

script: Layer.js

name: LayerJS

description: DHTML layers.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Shortcuts
  - More/Elements.From
  - BindInstances
  - Class.Mutators.Static
  - Class.Mutators.StoredInstances
  - Element.Delegation.Plus
  - Element.Plus
  - Function.Plus
  - HtmlOptionsJS
  - NamedChainJS
  - ResponsesJS

provides:
  - LayerJS

...
*/
/**
 * Events:
 * 		finishFetching: Fired when the content has been fetched.
 * 		finishPosting: Fired when the form has been successfully posted.
 * 		hide: Fired when the layer should start closing.
 * 		show: Fired when the layer should start showing.
 * 		startFetching: Fired when the layer is starting to fetch new content.
 * 		startPosting: Fired when the layer is starting to post a form.
 */
var LayerJS = new Class({
	Implements: [HtmlOptionsJS],
	StoredInstances: true,
	Static: {
		Chain: {
			/**
			 * Chain of actions for the method fetchUrl.
			 * 		fire_event: The chain item that fires the startFetching event.
			 * 		request: The chain item to actually fetch the item.
			 * 		wrapup: Wrapup the request and fire the event finishFetching.
			 */
			fetchUrl: {
				fire_event: 'LayerJS.fetchUrl:fire_event',
				request: 'LayerJS.fetchUrl:request',
				wrapup: 'LayerJS.fetchUrl:wrapup'
			},

			/**
			 * Chain of actions for the method hide.
			 * 		fire_event: The chain item that fires the hide event.
			 * 		hide: The chain item that hides the layer.
			 */
			hide: {
				fire_event: 'LayerJS.hide:fire_event',
				hide: 'LayerJS.hide:hide'
			},

			/**
			 * Chain of actions for the method show.
			 * 		fire_event: The chain item that fires the show event.
			 * 		request: The chain item that makes a request for the content of the layer.
			 * 		show: The chain item that show the layer.
			 */
			show: {
				fire_event: 'LayerJS.show:fire_event',
				request: 'LayerJS.show:request',
				show: 'LayerJS.show:show'
			},

			/**
			 * Chain of actions for the method submiForm.
			 * 		fire_event: The chain item that fires the startPosting event.
			 * 		request: The chain item that submits the form.
			 * 		wrapup: Wrapup the submission and fire the event finishPosting.
			 */
			submitForm: {
				fire_event: 'LayerJS.submitForm:fire_event',
				request: 'LayerJS.submitForm:request',
				wrapup: 'LayerJS.submitForm:wrapup'
			}
		},

		/**
		 * Get the instanced stored at the provided name or create a new one and store it there
		 * using the provided options.
		 *
		 * @param name		{String}	A unique name for the instance.
		 * @param options	{Object}	Optional. Refer to the options property.
		 * @returns {LayerJS}
		 */
		singleton: function(name, options) {
			var result = this.retrieveInstance(name);
			if(!result) {
				result = new LayerJS(options);
				result.storeInstance(name);
			}

			return result;
		}
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * The options are:
	 * 		onFinishFetching: (Function) The event "finishFetching".
	 * 		onFinishPosting: (Function) The event "finishPosting".
	 * 		onHide: (Function) The event "hide".
	 * 		onShow: (Function) The event "show".
	 * 		onStartFetching: (Function) The event "startFetching".
	 * 		onStartPosting: (Function) The event "startPosting".
	 *
	 * 		element: (Mixed) Either the identifier for the element or the element itself that is the
	 * 			layer. If not provided, one will be created.
	 * 		layer_classname: (String) The CSS class name for all the layer.
	 * 		intercept_classname: (String) The CSS class name for the element that this layer should
	 * 			intercept and process to update the layer.
	 * 		refetch: (Boolean) Whether or not the content of the layer should be refetched each time
	 * 			it is shown. If set to false, the url option will become null once fetching has
	 * 			completed.
	 * 		template: (String) The template for the layer. Note that the template is only used to
	 * 			create the containing element if an element wasn't provided.
	 * 		url: (String) The URL to get the content from. Note that the request will be made with
	 * 			fetchUrl.
	 *
	 * 		content_selector: (String) The CSS selector (relative to the layer wrapper) for the
	 * 			content of the layer.
	 * 		hide_selector: (String) The CSS selector (relative to the layer wrapper) for the element
	 * 			if clicked on, will hide the layer.
	 *
	 * @type {Object}	Various options.
	 */
	options: {
		/*
			// chain: The chain of actions.
			// layerjs: This LayerJS instance.

			onFinishFetching: function(layerjs, chain) {},
			onFinishPosting: function(layerjs, chain) {},
			onHide: function(layerjs, chain) {},
			onShow: function(layerjs, chain) {},
			onStartFetching: function(layerjs, chain) {},
			onStartPosting: function(layerjs, chain) {},
		*/

		element:				null,
		layer_classname:		'layerjs',
		intercept_classname:	'layer-intercept',
		refetch:				false,
		template:				null,
		url:					null,

		content_selector:	'.layer-content',
		hide_selector:		'.hide-layer'
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {Element}	The layer.
	 */
	element: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {ResponsesJS}	Handles all AJAX requests.
	 */
	$responses: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param options	{Object}	Optional. Refer to the options property.
	 * @class {LayerJS}
	 */
	initialize: function(options) {
		Class.bindInstances(this);

		// Build the layer if no element was provided
		if(!options || !options.element) { this.build(options); }
		else { this.element = document.id(options.element); }

		this.$responses = new ResponsesJS();
		this.$responses.addEvent('processItem', this.handleResponse)
			.addEvent('finishProcessing', this.$responses.continueChain);

		this.loadAllOptions(this.element, options);
		this.element.addClass(this.options.layer_classname).get('id');

		return this.attach();
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Event handler for clicking on a link within the layer.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that was clicked on.
	 * @returns {LayerJS}
	 */
	onClick: function(event, element) {
		// If the element matches the hide selector or is a children of it, we'll let the onHide
		// event handler handle it
		if(element.match(this.options.hide_selector) ||
		   element.getParent(this.options.hide_selector)) { return this; }

		// We'll only need to handle this if the element should be intercepted
		if(element.hasClass(this.options.intercept_classname)) {
			event.preventDefault();
			this.fetchUrl(element.getProperty('href'));
		}

		return this;
	},

	/**
	 * Event handler for hiding the layer.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The element that triggered the event.
	 * @returns {LayerJS}
	 */
	onHide: function(event, element) {
		event.preventDefault();
		return this.hide();
	},

	/**
	 * Event handler for submitting a form with the layer.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @param element	{Element}	The form element.
	 * @returns LayerJS
	 */
	onSubmit: function(event, element) {
		// We'll only need to handle this if the element should be intercepted
		if(element.hasClass(this.options.intercept_classname)) {
			event.preventDefault();
			this.submitForm(element);
		}

		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Attach all the necessary events.
	 *
	 * @returns {LayerJS}
	 */
	attach: function(selector) {
		this.element.delegateEvent('click', this.options.hide_selector, this.onHide);
		this.element.delegateEvent('click', 'a', this.onClick);
		this.element.delegateEvent('submit', 'form', this.onSubmit);
	},

	/**
	 * Build the layer.
	 *
	 * @param options	{Object}	Options as passed by the user.
	 * @returns {LayerJS}
	 */
	build: function(options) {
		// If a template was provided, use that as the template, otherwise, use an empty div
		if(options && options.template) {
			var elements = Elements.from(options.template);
			this.element = elements.getFirst();
		} else { this.element = new Element('div'); }

		this.element.inject(document.body).hide();
		return this;
	},

	/**
	 * Make a request to the provided URL and use the response to update the layer. Note that all
	 * requests will be made as a GET.
	 *
	 * @param url		{String}		The URL to fetch.
	 * @param caller	{NamedChainJS}	Optional and should be used internally. The chain of actions
	 * 		to continue running when the request is completed.
	 * @returns {LayerJS}
	 */
	fetchUrl: function(url, caller) {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.fetchUrl.fire_event, this.__fetchUrlFireEvent.curry(chain))
			.append(LayerJS.Chain.fetchUrl.request, this.__fetchUrlRequest.curry([chain, url]))
			.append(LayerJS.Chain.fetchUrl.wrapup, this.__fetchUrlWrapup.curry([chain, caller]))
			.run();

		return this;
	}, __fetchUrlFireEvent: function(chain) {
		this.fireEvent('startFetching', [this, chain]);
		chain.run();
	}, __fetchUrlRequest: function(chain, url) {
		this.$responses.send({
			method: 'get',
			url: url,
			extra_data : { chain: chain }
		});
	}, __fetchUrlWrapup: function(chain, parent_chain) {
		this.fireEvent('finishFetching', [this, chain]);
		if(instanceOf(parent_chain, NamedChainJS)) { parent_chain.run(); }
		chain.run();
	},

	/**
	 * Handles a response from the server. Below are the list of response types that is supported:
	 * 		layerjs:update - Updates the content of the layer with the provided
	 * 			html.
	 * 			{
	 * 				type: 'layerjs:update',
	 * 				html: '<p>The HTML to update with.</p>'
	 * 			}
	 *
	 * @param responses		{ResponsesJS}	The request object.
	 * @param response		{Object}		The response from the server.
	 * @returns {LayerJS}
	 */
	handleResponse: function(responses, response) {
		switch(response.type) {
			case 'LayerJS:update': this.updateContent(response.html); break;
			default: break;
		}

		return this;
	},

	/**
	 * Hide this layer.
	 *
	 * @returns {LayerJS}
	 */
	hide: function() {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.hide.fire_event, this.__hideFireEvent.curry(chain))
			.append(LayerJS.Chain.hide.hide, this.__hideHide.curry(chain))
			.run();

		return this;
	}, __hideFireEvent: function(chain) {
		this.fireEvent('hide', [this, chain]);
		chain.run();
	}, __hideHide: function(chain) {
		this.element.hide();
		chain.run();
	},

	/**
	 * Show this layer.
	 *
	 * @returns {LayerJS}
	 */
	show: function() {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.show.fire_event, this.__showFireEvent.curry(chain))
			.append(LayerJS.Chain.show.request, this.__showRequest.curry(chain))
			.append(LayerJS.Chain.show.show, this.__showShow.curry(chain))
			.run();

		return this;
	}, __showFireEvent: function(chain) {
		this.fireEvent('show', [this, chain]);
		chain.run();
	}, __showRequest: function(chain) {
		if(this.options.url) { this.fetchUrl(this.options.url, chain); }
		else { chain.run(); }
	}, __showShow: function(chain) {
		if(this.options.url && !this.options.refetch) { this.options.url = null; }

		this.element.show();
		chain.run();
	},

	/**
	 * Submit the provided form.
	 *
	 * @param form	{Element}	The form to submit.
	 * @returns {LayerJS}
	 */
	submitForm: function(form) {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.submitForm.fireEvent, this.__submitFormFireEvent.curry(chain))
			.append(LayerJS.Chain.submitForm.request, this.__submitFormRequest.curry([chain, form]))
			.append(LayerJS.Chain.submitForm.wrapup, this.__submitFormWrapup.curry(chain))
			.run();

		return this;
	}, __submitFormFireEvent: function(chain) {
		this.fireEvent('startPosting', [this, chain]);
		chain.run();
	}, __submitFormRequest: function(chain, form) {
		this.$responses.send({
			method: form.get('method'),
			url: form.get('action'),
			data: form.toQueryString(),
			extra_data: { chain: chain }
		});
	}, __submitFormWrapup: function(chain) {
		this.fireEvent('finishPosting', [this, chain]);
		chain.run();
	},

	/**
	 * Update the content of the layer.
	 *
	 * @param html	{String}	The content for the layer.
	 * @returns {LayerJS}
	 */
	updateContent: function(html) {
		var content = this.element.getElement(this.options.content_selector);
		if(content) { content.update(html); }
		return this;
	}
});


/*
---

name: Array.Plus

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Array.Plus

...
*/
Array.implement({
	/**
	 * Get the first item in the array or undefined if it is empty.
	 *
	 * @returns {Mixed}
	 */
	getFirst: function() {
		if(this.length > 0) { return this[0]; }
		else { return undefined; }
	}
});


/*
---

name: String.Plus

description: Extends the String native object to include useful methods to work with strings.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - String.Plus

...
*/
String.implement({
	/**
	 * Get all the configuration data from this string.
	 *
	 * This parses the string by first splitting on each white space. For each item, if it contains
	 * the colon, the text before it becomes the key and the text after it becomes the value. This
	 * is mainly used for parsing configuration data from the class names of an element.
	 *
	 * @returns {Object}
	 */
	toConfigurationData: function() {
		var result = {};
		this.split(' ').each(function(item) {
			if(item.contains(':')) {
				var configs = item.split(':');
				var key = configs.shift();
				var value = configs.join(':');

				this[key] = value;
			}
		}, result);

		return result;
	}
});


/*
---

name: Cookie.Plus

description: Enhance the base Cookie class so you can provide a type for the duration such as
	seconds, months, years, etc.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Class.Refactor

provides:
  - Cookie.Plus

...
*/
Class.refactor(Cookie, {
	/**
	 * @type {Object}	Adds another option to specify the type of the duration. The supported types
	 * 		are: years, days, hours, minutes, and seconds. Defaults to days.
	 */
	options: { type: 'days' },

	/**
	 * Overwrite to update the duration only when setting so that it takes the type into
	 * consideration.
	 *
	 * @param value		{String}	The value to set to the cookie.
	 * @returns {Cookie}
	 */
	write: function(value) {
		// Get the provided duration
		var duration = this.options.duration;
		if(duration === false) { this.options.duration = 0; }

		// Convert to days
		if(this.options.duration !== 0) {
			switch(this.options.type) {
				case 'years': this.options.duration *= 365; break;
				case 'seconds': this.options.duration /= 60;
				case 'minutes': this.options.duration /= 60;
				case 'hours': this.options.duration /= 24; break;
				case 'days':
				default: break;
			}
		}

		// Set the cookie then restore the duration
		this.previous(value);
		this.options.duration = duration;

		return this;
	}
});

