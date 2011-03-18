/*
---

name: BindInstances

description: Add ability to bind all instance methods to the current object. Previously this was a
	mutator but since it relies on the initialize mutator and that can be used by a lot of people.
	So I decided to simply make this a static method that one can call to bind the instances. Simply
	call this method in the class's initialize method before everything else to bind it.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - BindInstances

...
*/
Class.extend({
	/**
	 * Bind all instance methods of the provided object to itself.
	 *
	 * @param obj	{Object}	The object to bind.
	 * @returns {Object}	The provided object.
	 */
	bindInstances: function(bind) {
		var value;
		for(var key in bind) {
			value = bind[key];
			if((typeOf(value) === 'function') && (key !== '$caller')) {
				bind[key] = value.bind(bind);
			}
		}

		return bind;
	}
});
