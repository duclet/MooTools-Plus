/*
---

name: StoragesJS

description: Handle storage of data across page views.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - Plus/BindInstances
  - Plus/Cookie.Plus
  - Plus/String.Plus

provides:
  - StoragesJS
  - StoragesJS.Persistent
  - StoragesJS.Temporary

...
*/
var StoragesJS = {};

// ---------------------------------------------------------------------------------------------- //

/**
 * Base class for all storage engines.
 */
StoragesJS.Engines.Base = new Class({
	/**
	 * @type {string}	Prefix of all keys.
	 */
	$prefix: null,

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Create a new instance.
	 *
	 * @constructor
	 */
	initialize: function() {
		Class.bindInstances(this);
		this.$prefix = window.location.host.md5() + '_';

		return this;
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Retrieve a stored item.
	 *
	 * @param {string}		key		The key that the data was stored with.
	 * @return {*}
	 */
	get: function(key) { return null; },

	/**
	 * Store the provided item.
	 *
	 * @param {string}	key			The key to store the item with.
	 * @param {*}		value		The value to store.
	 * @param {int}		expires		The time, in seconds, for how long the value should be stored
	 * 		relative to now.
	 * @return {StoragesJS.Engines.Base}
	 */
	set: function(key, value, expires) { return this; }
});

/**
 * Storage engine that uses cookies.
 */
StoragesJS.Engines.Cookie = new Class({
	Extends: StoragesJS.Engines.Base,

	/**
	 * @inheritDoc
	 */
	get: function(key) {
		return JSON.decode(Cookie.read(this.$prefix + key));
	},

	/**
	 * @inheritDoc
	 */
	set: function(key, value, expires) {
		Cookie.write(this.$prefix + key, JSON.encode(value), {
			duration: expires === 0 ? 0 : (expires / 86400)
		});

		return this;
	}
});

/**
 * Storage engine that uses cookies but only last for the session.
 */
StoragesJS.Engines.CookieSession = new Class({
	Extends: StoragesJS.Engines.Cookie,

	/**
	 * The expires parameter is ignored.
	 *
	 * @inheritDoc
	*/
	set: function(key, value) {
		return this.parent(key, value, 0);
	}
});

/**
 * Storage engine that uses localStorage.
 */
StoragesJS.Engines.LocalStorage = new Class({
	Extends: StoragesJS.Engines.Base,

	/**
	 * @inheritDoc
	 */
	get: function(key) {
		var raw = window.localStorage.getItem(this.$prefix + key);
		if(raw) {
			var data = JSON.decode(raw);
			if(data.expires >= new Date().getTime()) { return data.value; }
		}

		return null;
	},

	/**
	 * @inheritDoc
	 */
	set: function(key, value, expires) {
		window.localStorage.setItem(
			this.$prefix + key,
			JSON.encode({value: value, expires: new Date().getTime() + (expires * 1000)})
		);

		return this;
	}
});

/**
 * Storage engine that uses sessionStorage.
 */
StoragesJS.Engines.SessionStorage = new Class({
	Extends: StoragesJS.Engines.Base,

	/**
	 * @inheritDoc
	 */
	get: function(key) {
		var raw = window.sessionStorage.getItem(this.$prefix + key);
		if(raw) { return JSON.decode(raw); }

		return null;
	},

	/**
	 * The expires parameter is ignored.
	 *
	 * @inheritDoc
	*/
	set: function(key, value) {
		window.sessionStorage.setItem(this.$prefix + key, JSON.encode(value));
		return this;
	}
});

// ---------------------------------------------------------------------------------------------- //

/**
 * Represents a storage that is persistent. It will first try to use localStorage and if that does
 * not exists, then uses cookies.
 */
(function() {
	var use_local_storage = false;
	try { use_local_storage = ('localStorage' in window) && (window.localStorage !== null); }
	catch(e) { }

	StoragesJS.Persistent = use_local_storage ?
		new StoragesJS.Engines.LocalStorage() :
		new StoragesJS.Engines.Cookie();
})();

/**
 * Represents a storage that will only be available during the current browsing session. This will
 * use sessionStorage if available, otherwise it uses cookies.
 */
(function() {
	var use_session_storage = false;
	try { use_session_storage = ('sessionStorage' in window) && (window.sessionStorage !== null); }
	catch(e) { }

	StoragesJS.Temporary = use_session_storage ?
		new StoragesJS.Engines.SessionStorage() :
		new StoragesJS.Engines.CookieSession();
})();
