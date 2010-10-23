YUITest.TestCases.BindInstances = {
	name: 'Tests for Class/BindInstances.js',

	testBindInstances: function() {
		var MyClass = new $C.Class({
			one: 'one',
			two: 'two',
			initialize: function(bind) {
				if(bind) { Class.bindInstances(this); }
			},

			changeOne: function() {
				this.one = 'ONE';
			},

			changeTwo: function() {
				this.two = 'TWO';
			}
		});

		var binded = new MyClass(true);
		var unbinded = new MyClass(false);

		$Y.Assert.areSame('one', binded.one);
		$Y.Assert.areSame('two', binded.two);
		$Y.Assert.areSame('one', unbinded.one);
		$Y.Assert.areSame('two', unbinded.two);

		binded.changeOne();
		unbinded.changeOne();

		$Y.Assert.areSame('ONE', binded.one);
		$Y.Assert.areSame('ONE', unbinded.one);

		binded.changeTwo.delay(0.25);
		unbinded.changeTwo.delay(0.25);

		this.wait(function() {
			$Y.Assert.areSame('TWO', binded.two);
			$Y.Assert.areSame('two', unbinded.two);
		}, 500);
	}
};
