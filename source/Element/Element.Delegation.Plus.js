/*
---

script: Element.Delegation.Plus.js

name: Element.Delegation.Plus

description: Extends the event delegation for extra support.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/*
  - More/Element.Delegation
  - Function.Plus

provides: [Element.Delegation.Plus]

...
*/
(function() {
	var constants = {
		ie_change: 'mootools-plus-element-delegation:ie-change',
		ie_submit: 'mootools-plus-element-delegation:ie-submit'
	};

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Check to see whether or not we should set the provided handler to the provided element.
	 *
	 * @param String	name		One of the above constants.
	 * @param Element	element		The element to check against.
	 * @param Function	fn			The function to check for.
	 * @returns Boolean
	 */
	var should_set = function(name, element, fn) {
		var handlers = element.retrieve(name) || [];
		var result = true;
		for(var i = 0, l = handlers.length; i < l; ++i) {
			if(handlers[i] == fn) {
				result = false;
				break;
			}
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
	 * @param Element	element		The parent element where the event will occur.
	 * @param String	selectors	The selectors for the children elements.
	 * @param Function	fn			The handler function.
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
	 * @param Element	element		The parent element where the event will actually occur.
	 * @param String	selectors	The selectors for the children elements.
	 * @param Function	fn			The handler function.
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

	Element.implement({
		/**
		 * Simply a wrapper around the element delegation to support the bubbling of the submit
		 * event in IE.
		 *
		 * @param String	type		The type of the event.
		 * @param String	children	The selectors to specify the children elements the event
		 * 		should be relayed to.
		 * @param Function	fn			The handler of the event.
		 * @returns Element		This element.
		 */
		delegateEvent: function(type, children, fn) {
			if(Browser.ie) {
				type = type.toLowerCase();
				switch(type) {
					case 'change': ie_change(this, children, fn); break;
					case 'submit': ie_submit(this, children, fn); break;
				}
			} else { this.addEvent(type + ':relay(' + children + ')', fn); }
		}
	});

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Custom handler for the focus/blur event so that it would bubbles.
	 *
	 * @param Event		event	The event that was triggered.
	 * @returns void
	 */
	var focusInHandler = function(event) { this.fireEvent('focusin'); };
	var focusOutHandler = function(event) { this.fireEvent('focusout'); };

	// Use event capturing to monitor the focus and blur event on browsers that isn't it
	if(!Browser.ie) {
		document.addEventListener('focus', focusInHandler, true);
		document.addEventListener('blur', focusOutHandler, true);
	}

	// And finally, allow focusin and focusout to be added as native events
	Object.append(Element.NativeEvents, {
		'focusin': 2,
		'focusout': 2
	});
})();
