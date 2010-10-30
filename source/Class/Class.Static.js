/*
---

script: Class.Static.js

name: Class.Mutators.Static

description: Mutator to allow the data given to it to be set to the class itself and not its
	prototype.

license: MIT-style license

authors:
- Duc Tri Le

requires:
- Core/MooTools

provides: [Class.Mutators.Static]

...
*/
/**
 * @param Mixed		data	The data to be set.
 * @returns void
 */
Class.Mutators.Static = function(data) {
	Array.from(data).each(this.extend, this);
};
