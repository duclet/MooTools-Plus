YUITest.TestCases.Array = {
	name: 'Tests for Types/Array.Plus.js',

	testGetFirst: function() {
		var a = $C.Array.from([]);
		var b = $C.Array.from(['one', 'two', 'three']);
		var c = $C.Array.from([1, 2, 3, 4]);

		$Y.Assert.isUndefined(a.getFirst());
		$Y.Assert.areSame('one', b.getFirst());
		$Y.Assert.areSame(1, c.getFirst());

		c.shift();
		$Y.Assert.areNotSame('2', c.getFirst());
		$Y.Assert.areSame(2, c.getFirst());
	}
};
