/*
---

script: Function.Plus.js

name: Function.Plus

description: Extends the Function native object to include useful methods to
	work with functions.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/Function

provides: [Function.Plus]

...
*/
Function.implement({
	/**
	 * Curry the provided arguments.
	 *
	 * @param Mixed		args	The arguments to always pass to the function
	 * 		(must be an array if passing more than one argument).
	 * @param Mixed		bind	The object that the "this" of the function will
	 * 		refer to.
	 * @returns Function	The currified function.
	 */
	curry: function(args, bind) {
		args = Array.from(args);
		args.unshift([bind, null].pick());

		return this.bind.apply(this, args);
	}
});
