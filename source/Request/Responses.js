/*
---

script: Responses.js

name: ResponsesJS

description: Handles JSON responses from the server with some preset callbacks.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - BindInstances
  - Element.Plus

provides: [ResponsesJS]

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

	/**
	 * The options are:
	 * 		onFinishProcessing: (Function) The event "finishProcessing".
	 * 		onProcessItem: (Function) The event "processItem".
	 * 		onStartProcessing: (Function) The event "startProcessing".
	 *
	 * 		change_cursor: (Boolean) Whether or not the change the cursor upon the request and
	 * 			restore it when done. Defaults to false.
	 *
	 * @var Object		Various options.
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

		change_cursor:	false
	},

	/**
	 * @var Object	$extra_args		Extra arguments provided when the request
	 * 		was made.
	 */
	extra_args: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param Object	options		Refer to the options property. Optional.
	 * @class ResponsesJS
	 */
	initialize: function(options) {
		Class.bindInstances(this);

		this.parent(options);
		this.options.link = 'cancel';
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
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	alertResponse: function(response) {
		window.alert(response.message);
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
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	callbackResponse: function(response) {
		this.fireEvent(this.getHandlerName(response.key), Array.from(response.parameters));
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
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	elementReplaceResponse: function(response) {
		document.id(response.element_id).replacesWith(response.html);
		response.html.stripScripts(true);
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
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	elementUpdateResponse: function(response) {
		document.id(response.element_id).update(response.html);
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
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	functionCallResponse: function(response) {
		var fn = eval(response.fn);
		var scope = eval(response.scope);
		fn.apply(scope, Array.from(response.parameters));
	},

	/**
	 * Response handler for "redirect". Redirect the user to a different page.
	 * 		{
	 * 			type: 'redirect',
	 * 			url: 'url_to_redirect_user'
	 * 		}
	 *
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	redirectResponse: function(response) {
		// Because window.location doesn't always work
		var form = new Element('form', {
			action: item.url,
			method: 'post'
		});

		form.inject(document.body);
		form.submit();
	},

	/**
	 * Response handler for "reload". Reload the current page.
	 * 		{ type: 'reload' }
	 *
	 * @param Object	response	The response from the server.
	 * @returns void
	 */
	reloadResponse: function(response) {
		window.location.reload();
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Add a custom handler for the response that will be taken care of by this class.
	 *
	 * @param String	name	The custom handler's name.
	 * @param Function	fn		The custom handler.
	 * @returns ResponsesJS
	 */
	addHandler: function(name, fn) {
		this.addEvent(this.getHandlerName(name), fn);
		return this;
	},

	/**
	 * Get a unique identifier for the provided handler name.
	 *
	 * @param String	name	The custom handler's name.
	 * @returns String
	 */
	getHandlerName: function(name) {
		return 'responsesjs_custom_handler_' + name;
	},

	/**
	 * Handles the response from the server.
	 *
	 * @param Object	response	The response.
	 * @returns ResponsesJS
	 */
	handleResponse: function(responses) {
		if(this.options.change_cursor && document.body) {
			document.body.setStyle('cursor', 'auto');
		}

		if(!responses) {
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

		this.extra_args = null;
		return this;
	},

	/**
	 * Make the request.
	 *
	 * @param Object	options		Optional. The options for the send Request. Will also accept
	 * 		data as a query string for compatibility reasons.
	 * @param Object	extra_args	Optional. Any extra arguments.
	 * @returns ResponsesJS
	 */
	send: function(options, extra_args) {
		if(extra_args) { this.extra_args = extra_args; }
		if(this.options.change_cursor && document.body) {
			document.body.setStyle('cursor', 'progress');
		}

		return this.parent(options);
	}
});
