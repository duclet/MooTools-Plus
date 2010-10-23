YUITest.TestCases.String = {
	name: 'Tests for Types/String.Plus.js',

	testToConfigurationData: function() {
		var s = 'k:value key:value:with:colon key2:some_other_value not it'
			.toConfigurationData();

		var d = {
			k: 'value',
			key: 'value:with:colon',
			key2: 'some_other_value'
		};

		$Y.Assert.areSame(d.k, s.k);
		$Y.Assert.areSame(d.key, s.key);
		$Y.Assert.areSame(d.key2, s.key2);
		$Y.Assert.isUndefined(s.not);
		$Y.Assert.isUndefined(s.it);
	}
};
