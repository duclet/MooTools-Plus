YUITest.TestCases.LayerJS = {
	name: 'Tests for Interface/Layer.js',

	testExistingLayer: function() {
		var element = $C.document.id('existing_layer');

		$Y.Assert.isNotNull(element);
		$Y.Assert.isFalse(element.hasClass('layerjs'));

		var layer = $C.LayerJS.singleton('existing_layer', { element: element });

		$Y.Assert.isTrue(element.hasClass('layerjs'));

		layer.show();
		$Y.Assert.areSame('block', element.getStyle('display'));

		element.fireEvent('click', {
			target: element.getElement('.hide'),
			preventDefault: function() {}
		});

		$Y.Assert.areSame('none', element.getStyle('display'));
	},

	testFetchUrl: function() {
		// Set the expected result
		new Request({
			url: '/tests/mootools-plus/response_setter.php',
			async: false,
			data: 'session_key=layerjs_fetch_url&data=' + JSON.encode([{
				type: 'LayerJS:update',
				html: 'Data fetched.'
			}])
		}).send();

		var layer = new $C.LayerJS({
			url: '/tests/mootools-plus/responses.php?session_key=layerjs_fetch_url',
			template: '<div><div class="layer-content"></div></div>',
			onFinishFetching: function(widget, chain) {
				this.resume(function() {
					$Y.Assert.areSame(
						'Data fetched.',
						widget.element.getElement('.layer-content').get('html')
					);
				});

				chain.run();
			}.bind(this)
		});

		$Y.Assert.isNotNull(layer.element);
		$Y.Assert.isNotNull(layer.element.getElement('.layer-content'));

		layer.show();
		this.wait(2000);
	},

	testSubmitForm: function() {
		// Set the expected result
		new Request({
			url: '/tests/mootools-plus/response_setter.php',
			async: false,
			data: 'session_key=layerjs_submit_form&data=' + JSON.encode([{
				type: 'LayerJS:update',
				html: 'Data submitted.'
			}])
		}).send();

		var wrapper = $C.document.id('layer_with_form');
		var form = wrapper.getElement('form');
		var layer = new $C.LayerJS({
			element: wrapper,
			onFinishPosting: function(widget, chain) {
				this.resume(function() {
					$Y.Assert.areSame(
						'Data submitted.',
						widget.element.getElement('.layer-content').get('html')
					);
				});

				chain.run();
			}.bind(this)
		});

		layer.hide();

		$Y.Assert.isNotNull(layer.element);
		$Y.Assert.isNotNull(layer.element.getElement('.layer-content'));

		layer.submitForm(form);
		this.wait(2000);
	},

	testUpdatingLayer: function() {
		var layer = $C.LayerJS.singleton('existing_layer');
		var content = layer.element.getElement('.content');
		layer.show();

		$Y.Assert.areSame('Update me.', content.get('html'));

		layer.updateContent('Updated content');
		$Y.Assert.areSame('Updated content', content.get('html'));
	}
};
