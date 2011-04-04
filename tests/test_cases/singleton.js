YUITest.TestCases.Singleton = {
	name: 'Tests for Class/Singleton.js',

	testSingleton: function() {
		var MyClass = new $C.Class({
			Static: {
				getClassName: function() {
					return 'SingletonTest:MyClass';
				}
			},
			name: null,
			initialize: function(instance, name) {
				this.name = name;
				return this;
			}
		});

		var one = Class.singleton(MyClass, 'first', 'ONE');
		$Y.Assert.areSame('ONE', one.name);

		var two = Class.singleton(MyClass, 'first');
		$Y.Assert.areSame('ONE', two.name);

		two.name = 'TWO';
		$Y.Assert.areSame('TWO', one.name);
		$Y.Assert.areSame('TWO', two.name);

		var three = Class.singleton(MyClass, 'first', 'THREE');
		$Y.Assert.areSame('TWO', one.name);
		$Y.Assert.areSame('TWO', two.name);
		$Y.Assert.areSame('TWO', three.name);

		$Y.Assert.areSame(one, two);
		$Y.Assert.areSame(one, three);
		$Y.Assert.areSame(two, three);
	}
};
