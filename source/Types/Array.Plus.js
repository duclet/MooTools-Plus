/*
---

name: Array.Plus

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Array.Plus

...
*/
Array.implement({
	/**
	 * Get the first item in the array or undefined if it is empty.
	 *
	 * @return {*}
	 */
	getFirst: function() {
		if(this.length > 0) { return this[0]; }
		else { return undefined; }
	}
});
