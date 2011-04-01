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
	 * @param {*}	args	The arguments to always pass to the function (must be an array if
	 * 		passing more than one argument).
	 * @param {*}	bind	The object that the "this" of the function will refer to.
	 * @return {function}	The currified function.
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
