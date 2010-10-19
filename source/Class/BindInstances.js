/*
---

script: BindInstances.js

name: BindInstances

description: Add ability to bind all instance methods to the current object.
	Previously this was a mutator but since it relies on the initialize mutator
	and that can be used by a lot of people. So I decided to simply make this a
	static method that one can call to bind the instances. Simply call this
	method in the class's initialize method before everything else to bind it.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - Class.Mutators.Static
  - Function.Plus

provides: [BindInstances]

...
*/
var BindInstances = new Class({
	Static: {
		/**
		 * Bind all instance methods of the provided object to itself.
		 *
		 * @param Object	obj		The object to bind.
		 * @returns Object	The provided object.
		 */
		bindInstances: function(bind) {
			Object.each(bind, function(value, key) {
				// Only bind it if it is a function and it is not the method
				// _current so that is special
				if((typeOf(value) === 'function') && (key !== '_current')) {
					this[key] = value.bind(this);
				}
			}, bind);

			return bind;
		}
	}
});
