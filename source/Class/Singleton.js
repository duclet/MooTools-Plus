/*
---

name: Singleton

description: Get a single instance of the provided class.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools

provides:
  - Singleton

...
*/
(function() {
	/**
	 * @type {Object.<string, Object.<string, *>>}		All the instances.
	 */
	var instances = {};

	/**
	 * Get the instance with the provided name for the provided class.
	 *
	 * @param {Object}		klass		The klass to create.
	 * @param {string=}		name		A unique for the instance.
	 * @param {Array}		args		Any other arguments to be passed to the constructor if
	 * 		the instance does not exist.
	 * @return {*}
	 */
	var get_instance = function(klass, name, args) {
		// Make sure the class has a name
		var class_name = klass.getClassName ? klass.getClassName() : '';
		if(class_name.length < 1) { return undefined; }

		name = [name, 'singleton'].pick();
		var class_instances = [instances[class_name], {}].pick();
		if(!class_instances[name]) {
			// Store the current list of instances
			instances[class_name] = class_instances;

			// Create the instance but specify it is prototyping so that the initialize method
			// does not get run
			klass.$prototyping = true;
			class_instances[name] = new klass();

			// Now that we have the instance, run the initialize method if it exists
			klass.$prototyping = false;
			if(class_instances[name].initialize) {
				class_instances[name].initialize.apply(
					class_instances[name], args.length ? [args] : []
				);
			}
		}

		return class_instances[name];
	};

	Class.extend({
		/**
		 * Get a single instance of the provided class using the provided name. If the instance does
		 * not exists, it is created with all the passed argument except for the very first one
		 * which is the class. Note that in order for this to word, the class MUST have a static
		 * method called "getClassName" that returns the unique name of the class.
		 *
		 * @param {Object}		klass		The klass to create.
		 * @param {string=}		name		A unique for the instance. If not provided, defaults to
		 * 		"singleton".
		 * @param {...*}		args		Any other arguments to be passed to the constructor if
		 * 		the instance does not exist.
		 * @return {*}
		 */
		singleton: function(klass, name) {
			return get_instance(klass, name, Array.from(arguments).slice(1));
		},

		/**
		 * Same as the method "singleton" except that the passed argument to the constructor will
		 * NOT include the instance name.
		 *
		 * @param {Object}		klass		The klass to create.
		 * @param {string=}		name		A unique for the instance. If not provided, defaults to
		 * 		"singleton".
		 * @param {...*}		args		Any other arguments to be passed to the constructor if
		 * 		the instance does not exist.
		 * @return {*}
		 */
		singletonWithoutName: function(klass, name) {
			return get_instance(klass, name, Array.from(arguments).slice(2));
		}
	});
})();
