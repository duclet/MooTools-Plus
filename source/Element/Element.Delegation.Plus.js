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
		 * @param {string}		type		The type of the event.
		 * @param {string}		selectors	The selectors to specify the children elements the event
		 * 		should be relayed to.
		 * @param {function}	fn			The handler of the event.
		 * @return {Element}
		 */
		delegateEvent: function(type, selectors, fn) {
			type = type.toLowerCase();
			if(!Browser.ie) {
				// At a point in time, MooTools didn't have support for the focusin and focusout
				// event. Now that it does and it sticking to the event being named focus and blur,
				// we'll need to change the name to make our code backwards compatible.
				switch(type) {
					case 'focusin': type = 'focus'; break;
					case 'focusout': type = 'blur'; break;
				}
			}

			return this.addEvent(type + ':relay(' + selectors + ')', fn);
		}
	});
})();
