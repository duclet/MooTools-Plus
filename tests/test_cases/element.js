YUITest.TestCases.Element = {
	name: 'Tests for Types/Element.Plus.js',

	_should: {
		ignore: {
			// IE7 and our test seems incompatible for the true width and height
			// functions so ignore them but it does work
			testGetTrueHeight: !!(Browser.ie && (Browser.version < 8)),
			testGetTrueWidth: !!(Browser.ie && (Browser.version < 8))
		}
	},

	testGetTrueHeight: function() {
		var element = $C.document.id('true_height');

		$Y.Assert.areNotSame(element.getHeight(), element.getTrueHeight());
		$Y.Assert.areSame(90, element.getTrueHeight());
	},

	testGetTrueWidth: function() {
		var element = $C.document.id('true_width');

		$Y.Assert.areNotSame(element.getWidth(), element.getTrueWidth());
		$Y.Assert.areSame(90, element.getTrueWidth());
	},

	testIDProperties: function() {
		var has_id = $C.document.getElement('.i_have_an_id');
		var generate_id = $C.document.getElement('.give_me_an_id');

		$Y.Assert.areSame('has_id', has_id.get('id'));
		$Y.Assert.isNotNull(generate_id.get('id'));
		$Y.Assert.isTrue(generate_id.get('id').length > 0);
	},

	testReplacesWith: function() {
		var original = $C.document.id('replace_me');
		var new_elements =
			'<div id="replaced" class="replaced">I was replaced</div>' +
			'<div id="replaced2" class="replaced">I was included</div>' +
			'<div id="replaced3" class="replaced"><span>So was I</span></div>' +
			'<div id="replaced4" class="replaced">Me too!</div>';

		$Y.Assert.areSame('Content hasn\'t been replaced.', original.get('html'));
		$Y.Assert.isNull($C.document.id('replaced'));

		original.replacesWith(new_elements);

		// The element may have been removed but its reference still exists
		$Y.Assert.areSame('Content hasn\'t been replaced.', original.get('html'));
		$Y.Assert.isNull($C.document.id('replace_me'));

		// Make sure the element exists
		$Y.Assert.isNotNull($C.document.id('replaced'));
		$Y.Assert.isNotNull($C.document.id('replaced2'));
		$Y.Assert.isNotNull($C.document.id('replaced3'));
		$Y.Assert.isNotNull($C.document.id('replaced4'));

		// And make sure they are in the right order
		var elements = $C.document.getElements('.replaced');
		$Y.Assert.areSame('replaced', elements[0].get('id'));
		$Y.Assert.areSame('replaced2', elements[1].get('id'));
		$Y.Assert.areSame('replaced3', elements[2].get('id'));
		$Y.Assert.areSame('replaced4', elements[3].get('id'));
	},

	testUpdate: function() {
		var element = $C.document.id('update');
		$Y.Assert.areSame('This has not been updated.', element.get('html'));

		element.update('Updated.<script type="text/javascript">window.update_me = true;</script>');

		// The fact that we are trimming and stripping is because of IE
		$Y.Assert.areSame('Updated.', element.get('html').stripScripts().trim());
		$Y.Assert.isTrue($C.update_me);
	}
};
