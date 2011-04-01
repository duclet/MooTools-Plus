/*
---

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
  - Plus/Element.Delegation.Plus
  - Plus/Element.Plus
  - Plus/Function.Plus
  - Plus/NamedChainJS
  - Plus/ResponsesJS
  - Plus/Singleton

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
	Static: {
		/**
		 * For use with Class.singleton. Returns the unique name of this class.
		 *
		 * @return {string}
		 */
		getClassName: function() { return 'AutoCompleteJS'; },

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
		}
	},

	/**
	 * The options are:
	 * 		onHide: (function) Event handler for the event hide.
	 * 		onPostShow: (function) Event handler for the event postShow.
	 * 		onPreShow: (function) Event handler for the event preShow.
	 * 		onSelection: (function) Event handler for the event selection.
	 *
	 * 		min_length: (int) The minimum number of characters before suggestions are fetched.
	 * 		query: (string) The name of the parameter to be sent if the server (if it is a string)
	 * 			that contains the user's input.
	 * 		extra_data: (Object) Any extra data to send along with the request to the server.
	 *
	 * @type {Object.<string, *>}	Various options.
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
	 * @type {ResponsesJS}		Handles all AJAX requests.
	 */
	$responses: null,

	/**
	 * @type {Array.<{value: string, display: string}>}		An array of objects containing all the
	 * 		possible suggestions.
	 */
	$suggestions: [],

	/**
	 * @type {boolean}		Whether or not the auto complete is currently visible.
	 */
	$visible: false,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {string|function}		If it is a string, it must be the URL to the server that will
	 * 		receive the user's input and must return the possible suggestions. If it is a function,
	 * 		the signature of the function is: function(autocompletejs) {}, where autocompletejs is
	 * 		this instance. You can get the query and the like from the input property.
	 */
	server: null,

	/**
	 * @type {Element}		The element that is this AutoCompleteJS instance in the DOM.
	 */
	element: null,

	/**
	 * References includes the following:
	 * 		loading: (Element) The element that has the loading message/image.
	 * 		suggestions: (Element) The wrapper element of the suggestions.
	 *
	 * @type {Object.<string, Element>}		References to other elements within the auto complete.
	 */
	elements: null,

	/**
	 * @type {Element}		The element that provided the input for the suggestions.
	 */
	input: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param {string|function}		server		Refer to the server property.
	 * @param {?Object}				options		Refer to the options property.
	 * @constructor
	 * @implements {Events}
	 * @implements {Options}
	 */
	initialize: function(server, options) {
		Class.bindInstances(this);
		this.setOptions(options);
		this.server = server;

		this.$responses = new ResponsesJS();
		this.$responses.addEvent('finishProcessing', this.$responses.continueChain)
			.addHandler('update_suggestions', this.updateSuggestionsHandler);

		return this.build().setup().attachInternal();
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Event handler for bluring out of the input field.
	 *
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
	 */
	onBlur: function(event, element) {
		return this.hide();
	},

	/**
	 * Event handler for clicking on a suggestion..
	 *
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
	 */
	onClick: function(event, element) {
		event.preventDefault();
		return this.setSelection(element.retrieve(AutoCompleteJS.Constants.INDEX));
	},

	/**
	 * Event handler for focusing on an input field.
	 *
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
	 */
	onFocus: function(event, element) {
		// Turn off the browser's auto complete
		element.setProperty('autocomplete', 'false');
		return this;
	},

	/**
	 * Event handler for a key down on the input field.
	 *
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
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
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
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
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The element that triggered the event.
	 * @return {AutoCompleteJS}
	 */
	onMouseOver: function(event, element) {
		var index = element.retrieve(AutoCompleteJS.Constants.INDEX);
		return this.setSelection(index);
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Response handler for updating the suggestions.
	 *
	 * @param {Array.<{value: string, display: string}>}	suggestions		The suggestions.
	 * @returns {AutoCompleteJS}
	 */
	updateSuggestionsHandler: function(suggestions) {
		this.$suggestions = suggestions;
		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Attach this instance to input fields that matched the provided selector.
	 *
	 * @param {string}		selector	The CSS selector for the elements that should have this auto
	 * 		complete instance.
	 * @return {AutoCompleteJS}
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
	 * @return {AutoCompleteJS}
	 */
	attachInternal: function() {
		this.element.delegateEvent('click', '.suggestion', this.onClick)
			.delegateEvent('mouseover', '.suggestion', this.onMouseOver);

		return this;
	},

	/**
	 * Create the wrapper element for the auto complete.
	 *
	 * @return {AutoCompleteJS}
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
	 * @param {string}		display		The display text.
	 * @returns {string}
	 */
	getDisplayText: function(display) {
		return display.replace(
			new RegExp('(' + this.input.get('value') + ')', 'gi'),
			'<span class="provided">$1</span>'
		);
	},

	/**
	 * Hide the auto complete.
	 *
	 * @return {AutoCompleteJS}
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
	 * @return {AutoCompleteJS}
	 */
	renderSuggestions: function() {
		// If there are no suggestions, just hide
		if(!this.$suggestions.length) { return this.hide(); }

		// Update the suggestions
		this.elements.suggestions.set('html', '');
		this.$suggestions.each(function(item, index) {
			new Element('div.suggestion').store(AutoCompleteJS.Constants.INDEX, index)
				.set('html', this.getDisplayText(item.display)).inject(this.elements.suggestions);
		}, this);

		// Make the first item the selected
		this.elements.suggestions.getElement('.suggestion').addClass('selected');
		return this;
	},

	/**
	 * Set the selection.
	 *
	 * @param {int}		index	The index of the selection to set.
	 * @return {AutoCompleteJS}
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
	 * Mainly for sub classes. Is run from constructor after build but before attachInternal.
	 *
	 * @returns {AutoCompleteJS}
	 */
	setup: function() {
		return this;
	},

	/**
	 * Show the suggestions for the current input.
	 *
	 * @return {AutoCompleteJS}
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
	 * @return {AutoCompleteJS}
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
