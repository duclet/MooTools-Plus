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

		this.element.addClass(this.options.layer_classname).get('id');
		this.$responses = new ResponsesJS();
		this.$responses.addEvent('processItem', this.handleResponse)
			.addEvent('finishProcessing', this.$responses.continueChain);

		// Now load all the options and attach the necessary events
		this.loadAllOptions(this.element, options);
		this.attach();

		return this;
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
