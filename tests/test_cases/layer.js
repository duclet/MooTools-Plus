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

	testFetchUrl: function() {
		var modified = new Class({
			Extends: $C.LayerJS,
			__fetchUrlFetch: function(chain, url) {
				this.$responses.extra_args = { chain: chain };
				this.$responses.send({
					method: 'get',
					url: url,
					data: 'data=' + JSON.encode([{
						type: 'layerjs:update',
						html: 'Data fetched.'
					}])
				});
			}
		});

		var layer = new modified('fetch_url', {
			template: '<div class="layer_content"></div>',
			onFinishFetching: function(widget, chain) {
				this.resume(function() {
					$Y.Assert.areSame(
						'Data fetched.',
						widget.element.getElement('.layer_content').get('html')
					);
				});

				chain.run();
			}.bind(this)
		});

		$Y.Assert.isNotNull(layer.element);
		$Y.Assert.isNull(layer.element.getElement('.layer_content'));
		layer.fetchUrl('/tests/mootools-plus/responses.php');
		this.wait(2000);
	},

	testSubmitForm: function() {
		var wrapper = $C.document.id('layer_with_form');
		var form = wrapper.getElement('form');
		var modified = new Class({
			Extends: $C.LayerJS,
			__submitFormPost: function(chain, form) {
				this.$responses.extra_args = { chain: chain };
				this.$responses.send({
					method: form.get('method'),
					url: form.get('action'),
					data: 'data=' + JSON.encode([{
						type: 'layerjs:update',
						html: 'Data submitted.'
					}])
				});
			}
		});

		var layer = new modified('submit_form', {
			element: wrapper,
			onFinishPosting: function(widget, chain) {
				this.resume(function() {
					$Y.Assert.areSame(
						'Data submitted.',
						widget.element.getElement('.layer_content').get('html')
					);
				});

				chain.run();
			}.bind(this)
		});

		layer.hide();

		$Y.Assert.isNotNull(layer.element);
		$Y.Assert.isNotNull(layer.element.getElement('.layer_content'));
		layer.submitForm(form);
		this.wait(2000);
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
