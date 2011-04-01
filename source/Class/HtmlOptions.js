/*
---

name: HtmlOptionsJS

description: Load configuration options from the HTML source.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Shortcuts
  - Function.Plus

provides:
  - HtmlOptionsJS

...
*/
/**
 * It is expected though that with the provided element, there exists another element that is the
 * container of all the configurations. All direct children of the element is considered to be an
 * option. The class of that child element determines the type of the configuration. The title
 * attribute is used for the key of the configuration option.
 *
 * Configuration Types:
 * 		boolean - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a Boolean. All values will be considered true unless it is the
 * 			string "false".
 * 		double - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a double.
 * 		eval - The innerText of the element will be passed to the function "eval" and the returned
 * 			value will be the value of the configuration. Be careful when using this.
 * 		event - The innerText of the element will be passed to the function "eval" and the returned
 * 			value will be set as an event. Be careful when using this.
 * 		html - The innerHTML of the element will be used as the value of the configuration. The
 * 			value is treated as a string.
 * 		integer - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as an integer.
 * 		string - The innerText of the element will be used as the value of the configuration. The
 * 			value is treated as a string.
 *
 * 	Sample Code:
 * 		Below is a sample of how the HTML would look like
 * 		<div id="wrapper">
 * 			<div class="htmloptions" style="display: none;">
 * 				<div class="boolean" title="visible">false</div>
 * 				<div class="string" title="id">my_id</div>
 * 				<div class="integer" title="delay">5000</div>
 * 				<div class="double" title="delay">15.24</div>
 * 				<div class="eval" title="callback">my_funct</div>
 * 				<div class="event" title="load">loadObserver</div>
 * 				<div class="html" title="template"><div id="something"></div></div>
 * 			</div>
 * 			...
 * 		</div>
 */
var HtmlOptionsJS = new Class({
	Implements: [Events, Options],

	// ------------------------------------------------------------------------------------------ //

	/**
	 * The available options are:
	 * 		options_selector: (String) The selector for the wrapper element of the options. Note
	 * 			that this will only target the first item that matched this selector.
	 *
	 * @type {Object.<string, *>}	Various options.
	 */
	options: {
		options_selector: '.htmloptions'
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Load all the options from the source HTML and then from the provided options.
	 *
	 * @param {Element}		wrapper		The wrapper element.
	 * @param {Object=}		options		Various other options to merge into our current list of
	 * 		options.
	 * @constructor
	 * @implements {Events}
	 * @implements {Options}
	 */
	loadAllOptions: function(wrapper, options) {
		this.loadOptions(wrapper);
		this.setOptions(options);

		return this;
	},

	/**
	 * Load extra options.
	 *
	 * This method is here for the sake of subclasses inheriting from it via extends. This allow
	 * other classes to provide extra functionalities for loading configuration from the source.
	 *
	 * @param {Object}		options		The options object.
	 * @param {Element}		element		The element holding the configuration data.
	 * @param {string}		type		The source type.
	 * @param {string}		key			The configuration key.
	 * @return {boolean}	Returns true if the configuration has been set and the default actions
	 * 		does not need to be executed. Returns false if the default actions should be taken.
	 */
	loadExtraOptions: function(options, element, type, key) { return false; },

	/**
	 * Load the options from the source HTML.
	 *
	 * @param {Element}		wrapper		The wrapper element.
	 * @return {HtmlOptionsJS}
	 */
	loadOptions: function(wrapper) {
		var config_wrapper = wrapper.getElement(this.options.options_selector);
		if(!config_wrapper) { return this; }

		config_wrapper.hide();
		config_wrapper.getChildren().each(this.setOption.curry(this.options, this));

		return this;
	},

	/**
	 * Set the data of the provided element to the provided option.
	 *
	 * @param {Object}		options		The options object.
	 * @param {Element}		element		The element containing the configuration data to set.
	 * @return {HtmlOptionsJS}
	 */
	setOption: function(options, element) {
		var type = element.get('class');
		var key = element.get('title');
		var data = element.get(type === 'html' ? 'html' : 'text');

		// Let subclasses have priority
		if(this.loadExtraOptions(options, element, type, key)) { return this; }

		// Onto the default actions
		switch(type) {
			case 'boolean': options[key] = data !== 'false'; break;
			case 'double': options[key] = data.toFloat(); break;
			case 'eval': options[key] = eval(data); break;
			case 'event': this.addEvent(key, eval(data)); break;
			case 'integer': options[key] = data.toInt(); break;
			case 'html': case 'string': options[key] = data; break;
			default: break; // Nothing to do for unsupported type
		}

		return this;
	}
});
