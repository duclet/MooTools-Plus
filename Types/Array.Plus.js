/*
---

script: Array.Plus.js

name: Array.Plus

description: Extends the Array native object to include useful methods to work
	with arrays.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/Array

provides: [Array.Plus]

...
*/
Array.implement({
	/**
	 * Get the first item in the array or undefined if it is empty.
	 *
	 * @returns Mixed
	 */
	getFirst: function() {
		if(this.length > 0) { return this[0]; }
		else { return undefined; }
	}
});
