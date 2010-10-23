YUITest.TestCases.Cookie = {
	name: 'Tests for Utilities/Cookie.Plus.js',

	testCookie: function() {
		$C.Cookie.write('testing', 'testing', { duration: 1, type: 'seconds' });
		$Y.Assert.areSame('testing', $C.Cookie.read('testing'));

		this.wait(function() {
			$Y.Assert.isNull($C.Cookie.read('testing'));
		}, 1100);
	}
};
