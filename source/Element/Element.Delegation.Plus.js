/*
---

name: Element.Delegation.Plus

description: Extends the event delegation for extra support.

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
	/**
	 * @type {Object}	Constants.
	 */
	var constants = {
		ie_change: 'mootools-plus-element-delegation:ie-change',
		ie_submit: 'mootools-plus-element-delegation:ie-submit'
	};

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Check to see whether or not we should set the provided handler to the provided element.
	 *
	 * @param name		{String}	One of the above constants.
	 * @param element	{Element}	The element to check against.
	 * @param fn		{Function}	The function to check for.
	 * @returns {Boolean}
	 */
	var should_set = function(name, element, fn) {
		var result = true, handlers = element.retrieve(name) || [];
		for(var i = 0, l = handlers.length; i < l; ++i) {
			if(handlers[i] == fn) { result = false; break; }
		}

		if(result) {
			handlers.push(fn);
			element.store(name, handlers);
		}

		return result;
	};

	/**
	 * Hack to set the change event on various inputs using focusin.
	 *
	 * @param element		{Element}	The parent element where the event will occur.
	 * @param selectors		{String}	The selectors for the children elements.
	 * @param fn			{Function}	The handler function.
	 * @returns void
	 */
	var ie_change = function(element, selectors, fn) {
		element.addEvent('focusin:relay(' + selectors + ')', function(fn, event, element) {
			if(should_set(constants.ie_submit, element, fn)) {
				var event_name = element.match('input[type=checkbox], input[type=radio]') ?
					'click' : 'change';

				element.addEvent(event_name, function(fn, element, event) {
					fn.attempt([event, element]);
				}.curry([fn, element]));
			}
		}.curry(fn));
	};

	/**
	 * Hack to make IE bubble the submit event. This simply attach a focusin event to the form which
	 * then in turn attaches the submit event to it.
	 *
	 * @param element		{Element}	The parent element where the event will actually occur.
	 * @param selectors		{String}	The selectors for the children elements.
	 * @param fn			{Function}	The handler function.
	 * @returns void
	 */
	var ie_submit = function(element, selectors, fn) {
		element.addEvent('focusin:relay(' + selectors + ')', function(fn, event, element) {
			if(should_set(constants.ie_submit, element, fn)) {
				element.addEvent('submit', function(fn, element, event) {
					fn.attempt([event, element]);
				}.curry([fn, element]));
			}
		}.curry(fn));
	};

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {Array}	The list of elements that is monitoring the focusin event.
	 */
	var focusInElements = [];

	/**
	 * @type {Array}	The list of elements that is monitoring the focusout event.
	 */
	var focusOutElements = [];

	/**
	 * Event handler for the focusin event.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @returns void
	 */
	var focusInHandler = function(event) {
		event = new Event(event);
		if((this == event.target) || (this.contains(event.target))) {
			focusInElements.invoke('fireEvent', 'focusin', event);
		}
	};

	/**
	 * Event handler for the focusout event.
	 *
	 * @param event		{Event}		The event that was triggered.
	 * @returns void
	 */
	var focusOutHandler = function(event) {
		event = new Event(event);
		if((this == event.target) || (this.contains(event.target))) {
			focusOutElements.invoke('fireEvent', 'focusout', event);
		}
	};

	// Use event capturing to monitor the focus and blur event on browsers that isn't it
	if(!Browser.ie) {
		document.addEventListener('focus', focusInHandler, true);
		document.addEventListener('blur', focusOutHandler, true);
	}

	// And finally, allow focusin and focusout to be added as native events
	Object.append(Element.NativeEvents, { 'focusin': 2, 'focusout': 2 });

	// ------------------------------------------------------------------------------------------ //

	Element.implement({
		/**
		 * Simply a wrapper around the element delegation to support the bubbling of the submit
		 * event in IE.
		 *
		 * @param type			{String}	The type of the event.
		 * @param selectors		{String}	The selectors to specify the children elements the event
		 * 		should be relayed to.
		 * @param fn			{Function}	The handler of the event.
		 * @returns {Element}
		 */
		delegateEvent: function(type, selectors, fn) {
			type = type.toLowerCase();
			if(Browser.ie) {
				switch(type) {
					case 'change': ie_change(this, selectors, fn); return this;
					case 'submit': ie_submit(this, selectors, fn); return this;
				}
			} else {
				switch(type) {
					case 'focusin': focusInElements.include(this); break;
					case 'focusout': focusOutElements.include(this); break;
				}
			}

			return this.addEvent(type + ':relay(' + selectors + ')', fn);
		}
	});
})();
