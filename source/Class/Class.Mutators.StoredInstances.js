 /*
---

script: Class.Mutators.StoredInstances.js

name: Class.Mutators.StoredInstances

description: Allow classes to stored instances that has been created.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/*

provides: [Class.Mutators.StoredInstances]

...
*/
Class.Mutators.StoredInstances = function() {
	this.extend({
		/**
		 * @var Object	All the instances that has been stored.
		 */
		$instances: {},

		/**
		 * Get a stored instance.
		 *
		 * @param String	id	The identifier that the instance was stored by.
		 * @returns Mixed	The stored instance or null if it does not exists.
		 */
		retrieveInstance: function(id) {
			return [this.$instances[id]].pick();
		}
	}).implement({
		/**
		 * Get a stored instance. Note that this simply allow you to access the static version of
		 * this method on the instance itself.
		 *
		 * @param String	id	The identifier that the instance was stored by.
		 * @returns Mixed	The stored instance or null if it does not exists.
		 */
		retrieveInstance: function(id) {
			return this.$caller.$owner.retrieveInstance(id);
		},

		/**
		 * Store this instance. Note that this will NOT overwrite another instance if the provided
		 * id already exists.
		 *
		 * @param String	id	The identifier for this instance.
		 * @returns Mixed	Returns true if the instance was successfully stored. If the another
		 * 		instance was already stored with the provided id, that instance is returned.
		 */
		storeInstance: function(id) {
			var instance = this.retrieveInstance(id);
			if(instance) { return instance; }

			this.$caller.$owner.$instances[id] = this;
			return true;
		}
	});
};
