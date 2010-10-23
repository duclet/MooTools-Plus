/*
---

script: Element.Delegation.Plus.js

name: Element.Delegation.Plus

description: Extends the event delegation for elements to allow the submit event
	to bubble in IE and the focusin and focusout event for browsers that is not
	IE.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Delegation
  - Function.Plus

provides: [Element.Delegation.Plus]

...
*/
(function() {
	var constants = {
		ie_submit: 'mootools-plus-element-delegation:ie-submit'
	};

	// ---------------------------------------------------------------------- //

	/**
	 * Hack to make IE bubble the submit event. This simply attach a focusin
	 * event to the form which then in turn attaches the submit event to it.
	 *
	 * @param Element	element		The parent element where the event will
	 * 		actually occur.
	 * @param String	selectors	The selectors for the children elements.
	 * @param Function	fn			The handler function.
	 * @returns void
	 */
	var ie_submit = function(element, selectors, fn) {
		element.addEvent('focusin:relay(' + selectors + ')', function(fn, event, element) {
			// Make sure we attach the same handler only once for the element
			var handlers = element.retrieve(constants.ie_submit) || [];
			var should_set = true;
			for(var i = 0; i < handlers.length; ++i) {
				if(handlers[i] == fn) { should_set = false; }
			}

			if(should_set) {
				handlers.push(fn);
				element.store(constants.ie_submit, handlers);
				element.addEvent('submit', function(fn, element, event) {
					fn.attempt([event, element]);
				}.curry([fn, element]));
			}
		}.curry(fn));
	};

	Element.implement({
		/**
		 * Simply a wrapper around the element delegation to support the
		 * bubbling of the submit event in IE.
		 *
		 * @param String	type		The type of the event.
		 * @param String	children	The selectors to specify the children
		 * 		elements the event should be relayed to.
		 * @param Function	fn			The handler of the event.
		 * @returns Element		This element.
		 */
		delegateEvent: function(type, children, fn) {
			if(Browser.ie && (type.toLowerCase() === 'submit')) {
				ie_submit(this, children, fn);
			} else {
				this.addEvent(type + ':relay(' + children + ')', fn);
			}
		}
	});

	// ---------------------------------------------------------------------- //

	/**
	 * Custom handler for the focus/blur event so that it would bubbles.
	 *
	 * @param Event		event	The event that was triggered.
	 * @returns void
	 */
	var focusInHandler = function(event) { this.fireEvent('focusin'); };
	var focusOutHandler = function(event) { this.fireEvent('focusout'); };

	// Use event capturing to monitor the focus and blur event on browsers that
	// isn't it
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
