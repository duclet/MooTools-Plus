/*
---

name: PopupJS

description: Handles window popups.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - BindInstances
  - Class.Mutators.Static
  - Function.Plus
  - Object.Plus

provides:
  - PopupJS

...
*/
var PopupJS = new Class({
	Implements: [Options],
	Static: {
		/**
		 * For use with Class.singleton. Returns the unique name of this class.
		 *
		 * @return {string}
		 */
		getClassName: function() { return 'PopupJS'; }
	},

	/**
	 * The options are:
	 * 		center: (boolean) Whether or not the popup should be at the center of the screen.
	 * 		exit_popup: (boolean) Whether or not the popup should try to pop upon the page
	 * 			unloading.
	 * 		height: (int) The height of the popup window in pixels.
	 * 		left: (int) The left offset for the popup window. If set, will override center option.
	 * 		other_features: (Object.<string, string>) Other features for the popup window.
	 * 		popunder: (boolean) Whether or not the popup should be a popunder.
	 * 		top: (int) The top offset for the popup window. If set, will override center option.
	 * 		width: (int) The width of the popup window in pixels.
	 *
	 * @type {Object.<string, *>}	Various options.
	 */
	options: {
		center:				true,
		exit_popup:			false,
		height:				100,
		left:				null,
		other_features:		{},
		popunder:			false,
		top:				null,
		width:				100
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {boolean}		Whether or not the window has popped.
	 */
	$popped: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {string}	The name for the popup window.
	 */
	name: null,

	/**
	 * @type {string}	The URL for the popup window.
	 */
	url: null,

	/**
	 * @type {Window}	The popup window if successfully popped.
	 */
	window: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param {string}		name		The name for the popup window.
	 * @param {string}		url			The URL for the popup window.
	 * @param {Object=}		options		Refer to the options property.
	 * @constructor
	 * @implements {Options}
	 */
	initialize: function(name, url, options) {
		Class.bindInstances(this);
		this.setOptions(options);

		this.name = name;
		this.url = url;
		this.$popped = false;

		return this.setup().attach();
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Attach all the necessary events.
	 *
	 * @return {PopupJS}
	 */
	attach: function() {
		if(this.options.exit_popup) { window.addEvent('unload', this.tryPop); }
		return this;
	},

	/**
	 * Get the dimensions for the popup window.
	 *
	 * @return {{height: int, width: int}}
	 */
	getPopupWindowDimension: function() {
		return {
			height: this.options.height,
			width: this.options.width
		};
	},

	/**
	 * Get the name of the window to pop.
	 *
	 * @return {string}
	 */
	getPopupWindowName: function() {
		return this.name;
	},

	/**
	 * Get the position for the popup window.
	 *
	 * @return {{x: int, y: int}}
	 */
	getPopupWindowPosition: function() {
		return {
			x: this.options.left,
			y: this.options.top
		};
	},

	/**
	 * See if the window has already popped.
	 *
	 * @return {boolean}
	 */
	hasPopped: function() {
		return this.$popped;
	},

	/**
	 * Mainly for sub classes. Is run from constructor before attach.
	 *
	 * @returns {PopupJS}
	 */
	setup: function() {
		return this;
	},

	/**
	 * See if the we should pop the window.
	 *
	 * @return {boolean}
	 */
	shouldPop: function() {
		return !this.hasPopped();
	},

	/**
	 * Try to pop the window.
	 *
	 * @return {boolean}	Returns true if the window has been popped, false otherwise.
	 */
	tryPop: function() {
		if(this.shouldPop()) {
			this.$popped = false;

			var features = Object.clone(this.options.features);
			var dimension = this.getPopupWindowDimension();
			var position = this.getPopupWindowPosition();

			Object.extend(features, {
				height:		dimensions.height,
				width:		dimensions.width,
				left:		position.x,
				top:		position.y
			});

			this.window = window.open(
				this.url, this.getPopupWindowName(), Object.toEncodedString(features, ',')
			);

			if(this.window !== null) {
				this.$popped = true;

				if(this.options.popunder) {
					// Blur and focus seems to get executed out of order sometimes so we need to
					// chain the execution in order to ensure proper order
					new Chain().chain(
						function(widget) { widget.window.blur(); this.callChain(); }.curry(widget),
						function() { window.focus(); this.callChain(); }
					).callChain();
				}
			}
		}

		return this.$popped;
	}
});
