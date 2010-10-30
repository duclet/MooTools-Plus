 /*
---

script: StoredInstances.js

name: StoredInstances

description: Allow classes to stored instances that has been created. While this can technically be 
	used as a stand alone, it is best used as a mixin to another class. Note that if you plan on 
	accessing the static methods, you'll need to mix this class in using both Implements and Static.

license: MIT-style license

authors:
  - Duc Tri Le

requires:
  - Core/MooTools
  - Class.Mutators.Static

provides: [StoredInstances]

...
*/
var StoredInstances = new Class({
	Static: {
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
	},

	// ------------------------------------------------------------------------------------------ //

	/**
	 * Get a stored instance. Note that this simply allow you to access the static version of this 
	 * method on the instance itself.
	 *
	 * @param String	id	The identifier that the instance was stored by.
	 * @returns Mixed	The stored instance or null if it does not exists.
	 */
	retrieveInstance: function(id) {
		return this.$caller.$owner.retrieveInstance(id);
	},

	/**
	 * Store this instance. Note that this will NOT overwrite another instance if the provided id 
	 * already exists.
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
