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
  - BindInstances
  - Class.Mutators.Static
  - Element.Delegation.Plus
  - Element.Plus
  - Function.Plus
  - HtmlOptionsJS
  - NamedChainJS
  - ResponsesJS
  - StoredInstances

provides: [LayerJS]

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
	Implements: [StoredInstances, HtmlOptionsJS],
	Static: {
		Chain: {
			/**
			 * Chain of actions (in order) for the method fetchUrl.
			 * 		fire_event: The chain item that fires the startFetching event.
			 * 		fetch: The chain item to actually fetch the item.
			 * 		wrapup: Wrapup the request and fire the event finishFetching.
			 */
			fetchUrl: {
				fetch: 'layerjs.fetchUrl:fetch',
				fire_event: 'layerjs.fetchUrl:fire_event',
				wrapup: 'layerjs.fetchUrl:wrapup'
			},

			/**
			 * Chain of actions (in order) for the method hide.
			 * 		fire_event: The chain item that fires the hide event.
			 * 		hide: The chain item that hides the layer.
			 */
			hide: {
				fire_event: 'layerjs.hide:fire_event',
				hide: 'layerjs.hide:hide'
			},

			/**
			 * Chain of actions (in order) for the method show.
			 * 		fire_event: The chain item that fires the show event.
			 * 		data_request: The chain item that makes a request for the content of the layer.
			 * 		show: The chain item that show the layer.
			 */
			show: {
				data_request: 'layerjs.show:data_request',
				fire_event: 'layerjs.show:fire_event',
				show: 'layerjs.show:show'
			},

			/**
			 * Chain of actions (in order) for the method submiForm.
			 * 		fire_event: The chain item that fires the startPosting event.
			 * 		post: The chain item that submits the form.
			 * 		wrapup: Wrapup the submission and fire the event finishPosting.
			 */
			submitForm: {
				fire_event: 'layerjs.submitForm:fire_event',
				post: 'layerjs.submitForm:post',
				wrapup: 'layerjs.submitForm:wrapup'
			}
		}
	},

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
	 * 		template: (String) The template for the layer. Note that the template is only used when
	 * 			the script cannot get the content area of the layer. As such, the template needs to
	 * 			contain an element that the provided content_selector specifies.
	 * 		url: (String) The URL to get the content from. Note that the request will be made with
	 * 			fetchUrl.
	 *
	 * 		content_selector: (String) The CSS selector (relative to the layer wrapper) for the
	 * 			content of the layer.
	 * 		hide_selector: (String) The CSS selector (relative to the layer wrapper) for the element
	 * 			if clicked on, will hide the layer.
	 *
	 * @var Object	Various options.
	 */
	options: {
		/*
			// layerjs: This LayerJS instance.
			// chain: The chain of actions.

			onFinishFetching: function(layerjs, chain) {},
			onFinishPosting: function(layerjs, chain) {},
			onHide: function(layerjs, chain) {},
			onShow: function(layerjs, chain) {},
			onStartFetching: function(layerjs, chain) {},
			onStartPosting: function(layerjs, chain) {},
		*/

		element:				null,
		layer_classname:		'layerjs',
		intercept_classname:	'layer_intercept',
		refetch:				false,
		template:				null,
		url:					null,

		content_selector:	'.layer_content',
		hide_selector:		'.hide_layer'
	},

	/**
	 * @var Element		The layer.
	 */
	element: null,

	/**
	 * @var ResponsesJS		Handles all AJAX requests.
	 */
	$responses: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param String	name		A unique name for the instance.
	 * @param Object	options		Refer to the options property. Optional.
	 * @class LayerJS
	 */
	initialize: function(name, options) {
		var instance = this.storeInstance(name);
		if(instance !== true) { return instance; }

		Class.bindInstances(this);

		// Build the layer if no element was provided
		if(!options || !options.element) { this.build(); }
		else { this.element = document.id(options.element); }

		this.element.addClass(this.options.layer_classname);
		this.$responses = new ResponsesJS({
			onProcessItem: this.handleResponse,
			onFinishProcessing: this.continueChain
		});

		// Now load all the options and attach the necessary events
		this.loadAllOptions(this.element, options);
		this.attach();

		return this;
	},

	/**
	 * Attach all the necessary events.
	 *
	 * @returns LayerJS
	 */
	attach: function(selector) {
		this.element.delegateEvent('click', this.options.hide_selector, this.onHide);
		this.element.delegateEvent('click', 'a', this.onClick);
		this.element.delegateEvent('submit', 'form', this.onSubmit);
	},

	/**
	 * Build the layer.
	 *
	 * @returns LayerJS
	 */
	build: function() {
		this.element = new Element('div');
		this.element.inject(document.body).hide();

		return this;
	},

	/**
	 * Continue running the chain stored to the responses object.
	 *
	 * @param ResponsesJS	responsesjs		The requestor.
	 * @param Array			responses		All the responses.
	 * @returns void
	 */
	continueChain: function(responsesjs, responses) {
		if(responsesjs.extra_args && responsesjs.extra_args.chain) {
			responsesjs.extra_args.chain.run();
		}
	},

	/**
	 * Make a request to the provided URL and use the response to update the layer. Note that all
	 * requests will be made as a GET.
	 *
	 * @param String	url		The URL to fetch.
	 * @param NamedChainJS	caller	Optional and should be used internally. The chain of actions to
	 * 		continue running when the request is completed.
	 * @returns LayerJS
	 */
	fetchUrl: function(url, caller) {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.fetchUrl.fireEvent, this.__fetchUrlFireEvent.curry(chain));
		chain.append(LayerJS.Chain.fetchUrl.fetch, this.__fetchUrlFetch.curry([chain, url]));
		chain.append(LayerJS.Chain.fetchUrl.wrapup, this.__fetchUrlWrapup.curry([chain, caller]));

		chain.run();
		return this;
	},
	__fetchUrlFireEvent: function(chain) {
		this.fireEvent('startFetching', [this, chain]);
		chain.run();
	},
	__fetchUrlFetch: function(chain, url) {
		// Oh Spinner from More
		this.$responses.extra_args = { chain: chain };
		this.$responses.send({ method: 'get', url: url });
	},
	__fetchUrlWrapup: function(chain, parent_chain) {
		this.fireEvent('finishFetching', [this, chain]);
		if(parent_chain) { parent_chain.run(); }
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
	 * @param ResponsesJS	responses	The requestor.
	 * @param Object		response	The response from the server.
	 * @returns void
	 */
	handleResponse: function(responses, response) {
		switch(response.type) {
			case 'layerjs:update': this.updateContent(response.html); break;
			default: break;
		}
	},

	/**
	 * Hide this layer.
	 *
	 * @returns LayerJS
	 */
	hide: function() {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.hide.fire_event, this.__hideFireEvent.curry(chain));
		chain.append(LayerJS.Chain.hide.hide, this.__hideHide.curry(chain));

		chain.run();
		return this;
	},
	__hideFireEvent: function(chain) {
		this.fireEvent('hide', [this, chain]);
		chain.run();
	},
	__hideHide: function(chain) {
		this.element.hide();
		chain.run();
	},

	/**
	 * Event handler for clicking on a link within the layer.
	 *
	 * @param Event		event		The event that was triggered.
	 * @param Element	element		The element that was clicked on.
	 * @returns LayerJS
	 */
	onClick: function(event, element) {
		// If the element matches the hide selector or is a children of it,
		// we'll let the onHide event handler handle it
		if(element.match(this.options.hide_selector) ||
		element.getParent(this.options.hide_selector)) { return this; }

		// We'll only need to handle this if the element should be intercepted
		if(element.hasClass(this.options.intercept_classname)) {
			event.preventDefault();
			this.fetchUrl(element.get('href'));
		}

		return this;
	},

	/**
	 * Event handler for hiding the layer.
	 *
	 * @param Event		event		The event that was triggered.
	 * @param Element	element		The element that triggered the event.
	 * @returns LayerJS
	 */
	onHide: function(event, element) {
		event.preventDefault();
		return this.hide();
	},

	/**
	 * Event handler for submitting a form with the layer.
	 *
	 * @param Event		event		The event that was triggered.
	 * @param Element	element		The form element.
	 * @returns LayerJS
	 */
	onSubmit: function(event, element) {
		// We'll only need to handle this if the element should be intercepted
		if(element.hasClass(this.options.intercept_classname)) {
			event.preventDefault();
			this.submitForm(element);
		}
	},

	/**
	 * Show this layer.
	 *
	 * @returns LayerJS
	 */
	show: function() {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.show.fire_event, this.__showFireEvent.curry(chain));
		chain.append(LayerJS.Chain.hide.data_request, this.__showDataRequest.curry(chain));
		chain.append(LayerJS.Chain.show.show, this.__showShow.curry(chain));

		chain.run();
		return this;
	},
	__showFireEvent: function(chain) {
		this.fireEvent('show', [this, chain]);
		chain.run();
	},
	__showDataRequest: function(chain) {
		// See if we actually need to make a request
		if(this.options.url) { this.fetchUrl(this.options.url, chain); }
		else { chain.run(); }
	},
	__showShow: function(chain) {
		if(this.options.url && !this.options.refetch) {
			this.options.url = null;
		}

		this.element.show();
		chain.run();
	},

	/**
	 * Submit the provided form.
	 *
	 * @param Element	form	The form to submit.
	 * @returns LayerJS
	 */
	submitForm: function(form) {
		var chain = new NamedChainJS();

		chain.append(LayerJS.Chain.submitForm.fireEvent, this.__submitFormFireEvent.curry(chain));
		chain.append(LayerJS.Chain.submitForm.post, this.__submitFormPost.curry([chain, form]));
		chain.append(LayerJS.Chain.submitForm.wrapup, this.__submitFormWrapup.curry(chain));

		chain.run();
		return this;
	},
	__submitFormFireEvent: function(chain) {
		this.fireEvent('startPosting', [this, chain]);
		chain.run();
	},
	__submitFormPost: function(chain, form) {
		// Oh Spinner from More
		this.$responses.extra_args = { chain: chain };
		this.$responses.send({
			method: form.get('method'),
			url: form.get('action'),
			data: form.toQueryString()
		});
	},
	__submitFormWrapup: function(chain) {
		this.fireEvent('finishPosting', [this, chain]);
		chain.run();
	},

	/**
	 * Update the content of the layer.
	 *
	 * @param String	html	The content for the layer.
	 * @returns LayerJS
	 */
	updateContent: function(html) {
		var content = this.element.getElement(this.options.content_selector);
		if(!content && this.options.template) {
			this.element.update(this.options.template);
			content = this.element.getElement(this.options.content_selector);
		}

		if(content) { content.update(html); }
		return this;
	}
});
