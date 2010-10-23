YUITest.TestCases.StoredInstances = {
	name: 'Tests for Class/StoredInstances.js',

	testStoredInstances: function() {
		var MyClass = new $C.Class({
			Static: [$C.StoredInstances],
			Implements: [$C.StoredInstances],
			name: null,
			changed: false,
			initialize: function(name) {
				var instance = this.storeInstance(name);
				if(instance !== true) { return instance; }

				this.name = name;
				return this;
			}
		});

		var one = new MyClass('one');
		var two = new MyClass('two');
		one.changed = true;

		$Y.Assert.areSame('one', one.name);
		$Y.Assert.areSame('two', two.name);
		$Y.Assert.isTrue(one.changed);

		var three = new MyClass('one');
		$Y.Assert.areSame('one', three.name);
		$Y.Assert.isTrue(three.changed);

		$Y.Assert.areSame(MyClass.$instances.one, one);
		$Y.Assert.areSame(MyClass.$instances.one, three);
	}
};
