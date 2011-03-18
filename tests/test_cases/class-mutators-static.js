YUITest.TestCases.StaticMutator = {
	name: 'Tests for Class/Class.Static.js',

	testMutator: function() {
		var MyClass = new $C.Class({
			Static: { ClassVariable: true }
		});

		$Y.Assert.isTrue(MyClass.ClassVariable);
	}
};
