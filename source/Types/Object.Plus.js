/*
---

name: Object.Plus

description: Extends the Object native to include useful methods to work with objects.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Object.Plus

...
*/
Object.extend({
	/**
	 * Convert the provided object to a string.
	 *
	 * @param {Object}		object				The object to convert.
	 * @param {string=}		value_separator		The string to use to separate the values. Defaults
	 * 		to "&".
	 * @param {string=}		key_separator		The string to use to separate the key and the value.
	 * 		Defaults to "=".
	 * @return {string}
	 */
	toEncodedString: function(object, value_separator, key_separator) {
		// Set the default values
		value_separator = [value_separator, '&'].pick();
		key_separator = [key_separator, '='].pick();

		var values = [];
		Object.each(object, function(key_separator, values, value, key) {
			if(value != null) { values.push(key + key_separator + encodeURIComponent(value)); }
		}.curry([key_separator, values]));

		return values.join(value_separator);
	}
});
