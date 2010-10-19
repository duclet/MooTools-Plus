/*
---

script: Cookie.Plus.js

name: Cookie.Plus

description: Enhance the base Cookie class so you can provide a type for the
	duration such as seconds, months, years, etc.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Class.Refactor

provides: [Cookie.Plus]

...
*/
Class.refactor(Cookie, {
	/**
	 * @var Object	Adds another option to specify the type of the duration.
	 * 		The supported types are: years, days, hours, minutes, and seconds.
	 * 		Defaults to days.
	 */
	options: { type: 'days' },

	/**
	 * Overwrite to update the duration only when setting so that it takes the
	 * type into consideration.
	 *
	 * @param String	value	The value to set to the cookie.
	 * @returns Cookie
	 */
	write: function(value) {
		// Get the provided duration
		var duration = this.options.duration;
		if(duration === false) { this.options.duration = 0; }

		// Convert to days
		if(this.options.duration !== 0) {
			switch(this.options.type) {
				case 'years': this.options.duration *= 365; break;
				case 'seconds': this.options.duration /= 60;
				case 'minutes': this.options.duration /= 60;
				case 'hours': this.options.duration /= 24; break;
				case 'days':
				default: break;
			}
		}

		// Set the cookie then restore the duration
		this.previous(value);
		this.options.duration = duration;

		return this;
	}
});
