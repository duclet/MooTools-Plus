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
	 * 		onFinishProcessing: (function) The event "finishProcessing".
	 * 		onProcessItem: (function) The event "processItem".
	 * 		onStartProcessing: (function) The event "startProcessing".
	 *
	 * 		change_cursor: (boolean) Whether or not the change the cursor upon the request and
	 * 			restore it when done. Defaults to false.
	 * 		extra_data: (Object) Any extra data that the user wants the handler to have when it
	 * 			parses the response. Note that this will be set to null once all the parsing is
	 * 			completed.
	 *
	 * @type {Object.<string, *>}	Various options.
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
	 * @param {Object=}		options		Refer to the options property.
	 * @constructor
	 * @extends {Request.JSON}
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {Object}	response	The response from the server.
	 * @returns {ResponsesJS}
	 */
	redirectResponse: function(response) {
		// Because window.location doesn't always work
		var form = new Element('form', {
			action: response.url,
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
	 * @param {Object}	response	The response from the server.
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
	 * @param {string}		name	The custom handler's name.
	 * @param {function}	fn		The custom handler.
	 * @return {ResponsesJS}
	 */
	addHandler: function(name, fn) {
		this.addEvent(this.getHandlerName(name), fn);
		return this;
	},

	/**
	 * Continue running the chain stored in extra data.
	 *
	 * @return {ResponsesJS}
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
	 * @param {string}		name	The custom handler's name.
	 * @return {string}
	 */
	getHandlerName: function(name) {
		return 'responsesjs_custom_handler_' + name;
	},

	/**
	 * Handles the response from the server.
	 *
	 * @param {Array.<{type: string, ...*}>}	responses	The responses.
	 * @return {ResponsesJS}
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
	 * @param {Object=}		options		The options for the send Request. Will also accept data as a
	 * 		query string for compatibility reasons.
	 * @return {ResponsesJS}
	 * @override
	 */
	send: function(options) {
		if(options && options.extra_data) { this.options.extra_data = options.extra_data; }
		if(this.options.change_cursor && document.body) {
			document.body.setStyle('cursor', 'progress');
		}

		return this.parent(options);
	}
});
