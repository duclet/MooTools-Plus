YUITest.TestCases.LayerJS = {
	name: 'Tests for Interface/Layer.js',

	testExistingLayer: function() {
		var element = $C.document.id('existing_layer');

		$Y.Assert.isNotNull(element);
		$Y.Assert.isFalse(element.hasClass('layerjs'));

		var layer = new $C.LayerJS('existing_layer', { element: element });

		$Y.Assert.isTrue(element.hasClass('layerjs'));

		layer.show();
		$Y.Assert.areSame('block', element.getStyle('display'));

		element.fireEvent('click', {
			target: element.getElement('.hide'),
			preventDefault: function() {}
		});

		$Y.Assert.areSame('none', element.getStyle('display'));
	},

	testUpdatingLayer: function() {
		var layer = new $C.LayerJS('existing_layer');
		var content = layer.element.getElement('.content');
		layer.show();

		$Y.Assert.areSame('Update me.', content.get('html'));

		layer.updateContent('Updated content');
		$Y.Assert.areSame('Updated content', content.get('html'));
	}
};
