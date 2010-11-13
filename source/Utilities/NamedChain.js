/*
---

name: NamedChainJS

description: Chaining of methods with names.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - BindInstances
  - Function.Plus

provides:
  - NamedChainJS

...
*/
var NamedChainJS = new Class({
	/**
	 * @type {Array}	The list of functions to run.
	 */
	$fns: [],

	/**
	 * @type {Array}	The keys for each function.
	 */
	$keys: [],

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @class {NamedChainJS}
	 */
	initialize: function() {
		Class.bindInstances(this);
		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Insert the provided function at the end of the chain.
	 *
	 * @param key	{String}	The key for the provided function.
	 * @param fn	{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	append: function(key, fn) {
		return this.insertAt(this.$fns.length, key, fn);
	},

	/**
	 * Clear the chain.
	 *
	 * @returns {NamedChainJS}
	 */
	clear: function() {
		this.$fns = [];
		this.$keys = [];

		return this;
	},

	/**
	 * Insert the provided function after a certain function.
	 *
	 * Note that if the provided key does not exist, then the function will be inserted at the end
	 * of the array.
	 *
	 * @param after		{String}	The key of the function that the provided function should be
	 * 		added after.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertAfter: function(after, key, fn) {
		var index = this.$keys.indexOf(after);
		if(index === -1) { index = this.$keys.length; }
		else { ++index; }

		return this.insertAt(index, key, fn);
	},

	/**
	 * Insert the provided function before a certain function.
	 *
	 * Note that if the provided key does not exist, then the function will be inserted at the begin
	 * 		of the array.
	 *
	 * @param before	{String}	The key of the function that the provided function should be
	 * 		added before.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertBefore: function(before, key, fn) {
		var index = this.$keys.indexOf(before);
		if(index === -1) { index = 0; }

		return this.insertAt(index, key, fn);
	},

	/**
	 * Insert the provided function at the provided index.
	 *
	 * @param index		{int}		The index of where the function should be inserted at.
	 * @param key		{String}	The key for the provided function.
	 * @param fn		{Function}	The function to add to the chain.
	 * @returns {NamedChainJS}
	 */
	insertAt: function(index, key, fn) {
		this.$keys.splice(index, 0, key);
		this.$fns.splice(index, 0, fn);
		return this;
	},

	/**
	 * Insert the provided function at the begining of the chain.
	 *
	 * @param key	{String}	The key for the provided function.
	 * @param fn	{Function}	The function to add to the chain.
	 * @param args	{Mixed}		Any extra arguments to be set to the function. If there is more than
	 * 		one argument, it should be set as an array.
	 * @returns {NamedChainJS}
	 */
	prepend: function(key, fn) {
		return this.insertAt(0, key, fn);
	},

	/**
	 * Remove the provided chain item.
	 *
	 * @param key	{String}	The key for the function.
	 * @returns {NamedChainJS}
	 */
	remove: function(key) {
		var index = this.$keys.indexOf(key);
		if(index !== -1) {
			this.$keys.splice(index, 1);
			this.$fns.splice(index, 1);
		}

		return this;
	},

	/**
	 * Pop the function off the top of the chain and run it.
	 *
	 * @returns {NamedChainJS}
	 */
	run: function() {
		if(this.$fns.length > 0) {
			this.$keys.shift();
			this.$fns.shift().call(this);
		}

		return this;
	}
});
