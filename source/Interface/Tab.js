/*
---

name: TabJS

description: Interface for tabs.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Element.Shortcuts
  - Array.Plus
  - BindInstances
  - Class.Mutators.Static
  - Element.Delegation.Plus
  - Element.Plus
  - Function.Plus
  - HtmlOptionsJS
  - NamedChainJS
  - Singleton

provides:
  - TabJS

...
*/
/**
 * Events:
 * 		show: Fired when a new tab is to be shown.
 */
var TabJS = new Class({
	Implements: [HtmlOptionsJS],
	Static: {
		/**
		 * For use with Class.singleton. Returns the unique name of this class.
		 *
		 * @return {string}
		 */
		getClassName: function() { return 'TabJS'; },

		Chain: {
			/**
			 * Chain of actions for the method show.
			 * 		fire_event: The chain item that fires the startFetching event.
			 * 		change_active: The chain item that change the active tab.
			 * 		show_tab_content: The chain item that shows the newly active tab content.
			 */
			show: {
				fire_event: 'TabJS.show:fire_event',
				change_active: 'TabJS.show:change_active',
				show_tab_content: 'TabJS.show:show_tab_content'
			}
		}
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * The options are:
	 * 		onShow: (function) The event "show".
	 *
	 * 		active_class: (string) The CSS class name of the tab that is currently active. Defaults
	 * 			to "active".
	 * 		contents_selector: (string) The CSS selector for the contents of the tabs. Defaults to
	 * 			".tab-content".
	 * 		tabs_selector: (string) The CSS selector for the tabs. Default to ".tab".
	 *
	 * @type {Object.<string, *>}	Various options.
	 */
	options: {
		/*
			// chain: The chain of actions.
			// tabjs: This TabJS instance.

			onShow: function(tabjs, chain) {},
		*/

		active_class:		'active',
		contents_selector:	'.tab-content',
		tabs_selector:		'.tab'
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {int}		The number of times all the tabs has been clicked on.
	 */
	$clicks: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * @type {Element}		The wrapper for the tabs.
	 */
	element: null,

	/**
	 * Currently, the following are available:
	 * 		active: the currently active tab
	 * 		contents: the list of tab contents
	 * 		tabs: the list of tabs
	 *
	 * @type {Object.<string, (Element|Elements)>}	Cache of various other elements selections.
	 */
	elements: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param {string|Element}		element		Either the element or its identifier that is the
	 * 		wrapper of the tabs.
	 * @param {?Object}				options		Refer to the options property.
	 * @constructor
	 * @implements {HtmlOptionsJS}
	 */
	initialize: function(element, options) {
		Class.bindInstances(this);

		this.element = document.id(element);
		this.loadAllOptions(this.element, options);

		this.$clicks = 0;
		this.elements = {
			contents: this.element.getElements(this.options.contents_selector),
			tabs: this.element.getElements(this.options.tabs_selector)
		};

		// Now lets loop over the tabs and its content and reference them
		this.elements.tabs.each(function(item, index) {
			this.setProperty(item, 'tab-number', index);
			this.setProperty(this.elements.contents[index], 'tab-number', index);
		}, this);

		return this.setup().this.attach().show(this.getActiveTab());
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Event handler for clicking on a tab.
	 *
	 * @param {Event}		event		The event that was triggered.
	 * @param {Element}		element		The tab to show.
	 * @return {TabJS}
	 */
	onClick: function(event, element) {
		event.preventDefault();
		return this.show(element);
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Attach all the necessary events.
	 *
	 * @return {TabJS}
	 */
	attach: function() {
		this.element.delegateEvent('click', this.options.tabs_selector, this.onClick);
		return this;
	},

	/**
	 * Get the currently active tab.
	 *
	 * @return {Element}
	 */
	getActiveTab: function() {
		var active = this.elements.tabs.filter(function(item) {
			return item.hasClass(this.options.active_class);
		}, this);

		// There can only be one active tab so if there isn't exactly one, the first tab is it
		if(active.length !== 1) { active = this.elements.tabs; }
		return active.getFirst();
	},

	/**
	 * Get the currently active tab content.
	 *
	 * @return {Element}
	 */
	getActiveTabContent: function() {
		var active = this.getActiveTab();
		return this.elements.contents[this.getProperty(active, 'tab-number')];
	},

	/**
	 * Get the value of the provided property stored within the provided element.
	 *
	 * @param {Element}		element		The element to get the property from.
	 * @param {string}		property	The name of the property.
	 * @returns {String}
	 */
	getProperty: function(element, property) {
		return element.getProperty('data-tabjs-' + property);
	},

	/**
	 * Set the provided property to the provided element.
	 *
	 * @param {Element}		element		The element to set the property for.
	 * @param {string}		property	The name of the property.
	 * @param {string}		value		The value of the property.
	 * @return {TabJS}
	 */
	setProperty: function(element, property, value) {
		element.setProperty('data-tabjs-' + property, value);
		return this;
	},

	/**
	 * Mainly for sub classes. Is run from constructor before attaching any events.
	 *
	 * @returns {TabJS}
	 */
	setup: function() {
		return this;
	},

	/**
	 * Show the provided tab.
	 *
	 * @param {Element}		element		The tab to show.
	 * @return {TabJS}
	 */
	show: function(element) {
		// Nothing to do if the provided tab is currently active
		var current = this.getActiveTab();
		if((this.$clicks++ > 0) && (current === element)) { return this; }

		var chain = new NamedChainJS();

		chain.append(TabJS.Chain.show.fire_event, this.__showFireEvent.curry(chain))
			.append(TabJS.Chain.show.change_active, this.__showChangeActive.curry([chain, element]))
			.append(TabJS.Chain.show.show_tab_content, this.__showShowTabContent.curry(chain))
			.run();

		return this;
	}, __showFireEvent: function(chain) {
		this.fireEvent('show', [this, chain]);
		chain.run();
	}, __showChangeActive: function(chain, element) {
		this.elements.tabs.removeClass(this.options.active_class);
		this.elements.contents.removeClass(this.options.active_class);

		element.addClass(this.options.active_class);
		this.getActiveTabContent().addClass(this.options.active_class);
		chain.run();
	}, __showShowTabContent: function(chain) {
		this.elements.contents.hide();
		this.getActiveTabContent().show();
		chain.run();
	}
});
