YUITest.TestCases.HtmlOptionsJS = {
	name: 'Tests for Utilities/HtmlOptions.js',

	testHtmlOptionsJS: function() {
		var MyClass = new $C.Class({
			Implements: [$C.HtmlOptionsJS],

			options: {
				/*
					onLoad: function() {},
				*/

				callback: function() {},
				delay: 0,
				id: 'unknown',
				other: false,
				price: 0,
				visible: true
			},

			initialize: function(element, options) {
				this.loadAllOptions($C.document.id(element), options);
				this.fireEvent('load');
				return this;
			},

			runCallback: function() {
				this.options.callback.apply(this);
			}
		});

		var instance = new MyClass('wrapper', { other: true });

		$Y.Assert.isTrue(instance.options.other);
		$Y.Assert.areSame(5000, instance.options.delay);
		$Y.Assert.areSame('my_id', instance.options.id);
		$Y.Assert.areSame(15.24, instance.options.price);
		$Y.Assert.isFalse(instance.options.visible);

		$Y.Assert.isTrue($C.ChangeMe.asEvent);
		$Y.Assert.isFalse($C.ChangeMe.asEval);

		instance.runCallback();
		$Y.Assert.isTrue($C.ChangeMe.asEval);
	}
};
