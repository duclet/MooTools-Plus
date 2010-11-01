/*
---

script: String.Plus.js

name: String.Plus

description: Extends the String native object to include useful methods to work with strings.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides: [String.Plus]

...
*/
String.implement({
	/**
	 * Get all the configuration data from this string.
	 *
	 * This parses the string by first splitting on each white space. For each item, if it contains
	 * the colon, the text before it becomes the key and the text after it becomes the value. This
	 * is mainly used for parsing configuration data from the class names of an element.
	 *
	 * @returns Object
	 */
	toConfigurationData: function() {
		var result = {};
		this.split(' ').each(function(item) {
			if(item.contains(':')) {
				var configs = item.split(':');
				var key = configs.shift();
				var value = configs.join(':');

				this[key] = value;
			}
		}, result);

		return result;
	}
});
