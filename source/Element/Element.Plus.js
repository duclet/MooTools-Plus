/*
---

name: Element.Plus

description: Extends the Element native object to include useful methods to work with elements.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Elements.From

provides:
  - Element.Plus

...
*/
Element.implement({
	/**
	 * Get the height of this element minus the padding and border.
	 *
	 * @returns {int}
	 */
	getTrueHeight: function() {
		var old_overflow = this.getStyle('overflow');
		this.setStyle('overflow', 'hidden');

		var height = this.getHeight() -
			this.getStyle('padding-top').toInt() -
			this.getStyle('padding-bottom').toInt() -
			this.getStyle('border-top-width').toInt() -
			this.getStyle('border-bottom-width').toInt();

		this.setStyle('overflow', old_overflow);
		return height;
	},

	/**
	 * Get the width of this element minus the padding and border.
	 *
	 * @returns {int}
	 */
	getTrueWidth: function() {
		var old_overflow = this.getStyle('overflow');
		this.setStyle('overflow', 'hidden');

		var width = this.getWidth() -
			this.getStyle('padding-left').toInt() -
			this.getStyle('padding-right').toInt() -
			this.getStyle('border-left-width').toInt() -
			this.getStyle('border-right-width').toInt();

		this.setStyle('overflow', old_overflow);
		return width;
	},

	/**
	 * Replace this element using the provided HTML.
	 *
	 * @param html	{String}	The HTML to replace this element by.
	 * @returns {Element}
	 */
	replacesWith: function(html) {
		var elements = Elements.from(html);
		var first_element = elements.shift();

		// Replace this element with the first element from the list
		first_element.replaces(this);

		// Reverse the remaining elements and insert after the previous element
		elements.reverse().invoke('inject', first_element, 'after');

		return this;
	},

	/**
	 * Update the inner HTML of the element and evaluate any scripts within the HTML.
	 *
	 * @param html	{Mixed}		The HTML to update the element with. This will be converted to a
	 * 		String using toString if it exists, if not, it will be forcefully made a string.
	 * @returns {Element}
	 */
	update: function(html) {
		var processed = html.toString ? html.toString() : ('' + html);
		this.set('html', processed);
		processed.stripScripts(true);

		return this;
	}
});

// ---------------------------------------------------------------------------------------------- //

(function() {
	/**
	 * @type {int}	Counter for generating IDs.
	 */
	var id_counter = 1;
	Element.Properties.id = {
		/**
		 * Get the identifier of this element or create one and set it to the element then return
		 * it.
		 *
		 * @returns {String}
		 */
		get: function() {
			var id = this.id;
			if(id.length < 1) {
				do { id = 'anonymous_id_' + id_counter++; }
				while(document.id(id));

				this.set('id', id);
			}

			return id;
		}
	};
})();
