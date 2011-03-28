/*
---

name: AssetManagerJS

description: Allow predefinition of assets and load on demand.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - More/Assets
  - Plus/BindInstances
  - Plus/Function.Plus
  - Plus/NamedChainJS

provides:
  - AssetManagerJS

...
*/
var AssetManagerJS = {
	/**
	 * Each asset should have a unique name and its value should be an object with the following
	 * properties:
	 * 		name: (String) The unique name of the asset.
	 * 		source: (String) The URL to the file to load the asset.
	 * 		loading: (Boolean) Whether or not the asset is currently loading.
	 * 		loaded: (Boolean) Whether or not the asset has already been loaded.
	 * 		callbacks: (Array) The callbacks to run once the resource has been loaded.
	 * 		requires: (Array) An array containing the unique names of the assets that is required to
	 * 			be loaded before this asset can be loaded.
	 *
	 * @type {Object}	The list of available assets.
	 */
	assets: {
		css: {},
		javascript: {}
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Add a resource. Note that this will overwrite resources information if the name provided
	 * already exists.
	 *
	 * @param type		{String}	The type of the resource to add. Can be either css or
	 * 		javascript.
	 * @param name		{String}	The unique name for the resource.
	 * @param source	{String}	The URL to fetch the resource.
	 * @param options	{Object}	Various other options for the resource. Available options are
	 * 		simply any option specify in the property "assets" except for name, source, callbacks,
	 * 		loading, and loaded.
	 * @returns {AssetManagerJS}
	 */
	add: function(type, name, source, options) {
		var data = [options, {}].pick();
		data.name = name;
		data.source = source;
		data.callbacks = [];
		data.loading = false;
		data.loaded = false;

		AssetManagerJS.assets[type][name] = data;
		return AssetManagerJS;
	},

	/**
	 * Load the provided asset and run the provided callback when completed.
	 *
	 * @param type			{String}		The type of the asset to load. Can be either css or
	 * 		javascript.
	 * @param asset			{String}		The unique name of the asset to load.
	 * @param callback		{Function}		The callback to run once the asset has been loaded.
	 * 		Optional.
	 * @returns {AssetManagerJS}
	 */
	load: function(type, asset, callback) {
		var asset_data = AssetManagerJS.assets[type][asset];

		// If the callback is a function, add it to the stack of callbacks for the asset
		if(typeOf(callback) === 'function') { asset_data.callbacks.push(callback); }

		// If asset is currently loading, we don't need to do anything else; if it is already
		// loaded, then run the callbacks
		if(asset_data.loading) { return AssetManagerJS; }
		else if(asset_data.loaded) { return AssetManagerJS.runCallbacks(type, asset); }

		// If we made it here, then we'll need to load the asset
		asset_data.loading = true;
		var chain = Class.bindInstances(new Chain());

		// First, take care of the dependencies if there are any
		if(asset_data.requires) {
			chain.chain(AssetManagerJS.ready.curry([type, asset_data.requires, chain.callChain]));
		}

		// Now load the resource
		chain.chain(function(type, asset_data) {
			switch(type) {
				case 'css':
					Asset.css(asset_data.source, { onLoad: this.callChain });
					break;
				case 'javascript':
					Asset.javascript(asset_data.source, { onLoad: this.callChain});
					break;
				default: this.callChain(); break;
			}
		}.curry([type, asset_data]));

		// And finally, specify the file has been loaded and run the callback
		chain.chain(function(type, asset_data) {
			asset_data.loading = false;
			asset_data.loaded = true;
			AssetManagerJS.runCallbacks(type, asset_data.name);
			this.callChain();
		}.curry([type, asset_data]));

		// Finally, run the chain
		chain.callChain();
		return AssetManagerJS;
	},

	/**
	 * Run the provided callback when the provided asset is ready to be used.
	 *
	 * @param type			{String}		The type of the asset to load. Can be either css or
	 * 		javascript.
	 * @param assets		{Array}			The list of assets that needs to be loaded before the
	 * 		provided callback is run.
	 * @param callback		{Function}		The callback to run once all the provided assets has
	 * 		been loaded. Optional.
	 * @returns {AssetManagerJS}
	 */
	ready: function(type, assets, callback) {
		var chain = Class.bindInstances(new Chain());
		var monitor = new AssetManagerJS.LoadMonitor(assets.length, chain.callChain);

		// Load all the assets
		chain.chain(function(type, assets, monitor) {
			assets.each(function(type, monitor, asset) {
				AssetManagerJS.load(type, asset, monitor.assetLoaded);
			}.curry([type, monitor]));
		}.curry([type, assets, monitor]));

		// If callback is provided, add it as the last item of the chain
		if(typeOf(callback) === 'function') {
			chain.chain(function(callback) {
				callback();
				this.callChain();
			}.curry(callback));
		}

		// Finally, run the chain
		chain.callChain();
		return AssetManagerJS;
	},

	/**
	 * Run all the callbacks for the provided asset.
	 *
	 * @param type		{String}	The type of the asset.
	 * @param name		{String}	The unique name of the asset.
	 * @returns {AssetManagerJS}
	 */
	runCallbacks: function(type, name) {
		var asset = AssetManagerJS.assets[type][name];

		var callback = asset.shift();
		while(callback) {
			callback();
			callback = asset.shift();
		}

		return AssetManagerJS;
	}
};

/**
 * Monitors the loading status of assets.
 */
AssetManagerJS.LoadMonitor = new Class({
	/**
	 * @type {Function}		The callback to execute once all the assets has been loaded.
	 */
	callback: null,

	/**
	 * @type {int}		The number of assets that has been loaded.
	 */
	loaded: null,

	/**
	 * @type {int}		The total number of assets to be loaded.
	 */
	total: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @param total			{int}			The total number of assets to load.
	 * @param callback		{Function}		The callback to execute once the assets have all been
	 * 		loaded.
	 * @class AssetManagerJS.LoadMonitor
	 */
	initialize: function(total, callback) {
		Class.bindInstances(this);

		this.loaded = 0;
		this.total = total;
		this.callback = callback;
	},

	/**
	 * Specify that one more resource has been loaded.
	 *
	 * @returns {AssetManagerJS.LoadMonitor}
	 */
	assetLoaded: function() {
		++this.loaded;

		// If all all assets are loaded and we have a callback, run it
		if((this.loaded === this.total) && (typeOf(this.callback) === 'function')) { callback(); }

		return this;
	}
});
