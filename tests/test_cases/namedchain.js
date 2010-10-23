YUITest.TestCases.NamedChainJS = {
	name: 'Tests for Utilities/NamedChain.js',

	testNamedChainJS: function() {
		var called = [];
		var chain = new $C.NamedChainJS();

		// Add items to the chain of items to run
		chain.append('second', function() {
			called.push('second');
			this.run()
		});

		chain.append('fourth', function(passed_arg) {
			if(passed_arg === 'passed') {
				called.push('fourth');
				this.run();
			}
		}.curry('passed'));

		chain.prepend('first', function() {
			called.push('first');
			this.run();
		});

		chain.append('sixth', function() {
			called.push('sixth');
			this.run();
		});

		chain.insertAfter('second', 'third', function() {
			called.push('third');
			this.remove('third-repeat');
			this.run();
		});

		// This should not be called because it was removed by the function
		// labeled third which remove it from the chain
		chain.insertAfter('third', 'third-repeat', function() {
			called.push('third-repeat');
			this.run();
		});

		chain.insertBefore('sixth', 'fifth', function() {
			called.push('fifth');
			this.run();
		});

		// This should not be called because the "last" function does not have
		// this.run()
		chain.append('tenth', function() {
			called.push('tenth');
			this.run();
		});

		chain.insertBefore('tenth', 'last', function() {
			called.push('last');
		});

		// Now the chain of actions
		chain.run();

		$Y.ArrayAssert.itemsAreSame(
			['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'last'],
			called
		);
	}
};
