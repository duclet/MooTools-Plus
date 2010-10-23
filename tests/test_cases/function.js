YUITest.TestCases.Function = {
	name: 'Tests for Types/Function.Plus.js',

	testCurry: function() {
		var change_me = 'old';
		var a = function(one, two, three) {
			change_me = this + '-' + one + '-' + two + '-' + three;
		};

		var b = a.curry(['one'], 'this');
		var c = a.curry(['one', 'two'], 'that');

		a.bind('this')(1, 2, 3);
		$Y.Assert.areSame('this-1-2-3', change_me);

		b(1, 2, 3);
		$Y.Assert.areSame('this-one-1-2', change_me);

		c(1, 2, 3);
		$Y.Assert.areSame('that-one-two-1', change_me);
	}
};
