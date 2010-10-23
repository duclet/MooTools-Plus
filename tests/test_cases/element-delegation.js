YUITest.TestCases.ElementDelegation = {
	name: 'Tests for Types/Element.Delegation.Plus.js',

	_should: {
		ignore: {
			testFocusin: Browser.ie,
			testFocusout: Browser.ie,
			testSubmit: !Browser.ie
		}
	},

	testFocusin: function() {
		var parent = $C.document.id('parent');
		parent.delegateEvent(
			'focusin', '.child', function(event, element) {
				element.set('data-focused', 'true');
			}
		);

		var child = $C.document.id('child2');
		parent.fireEvent('focusin', {target: child});

		$Y.Assert.areSame('false', $C.document.id('child1').get('data-focused'));
		$Y.Assert.areSame('false', $C.document.id('child3').get('data-focused'));
		$Y.Assert.areSame('true', child.get('data-focused'));
	},

	testFocusout: function() {
		var parent = $C.document.id('parent');
		parent.delegateEvent(
			'focusout', '.child', function(event, element) {
				element.set('data-blurred', 'true');
			}
		);

		var child = $C.document.id('child2');
		parent.fireEvent('focusout', {target: child});

		$Y.Assert.areSame('false', $C.document.id('child1').get('data-blurred'));
		$Y.Assert.areSame('false', $C.document.id('child3').get('data-blurred'));
		$Y.Assert.areSame('true', child.get('data-blurred'));
	},

	testSubmit: function() {
		var body = $C.document.id($C.document.body);
		body.delegateEvent(
			'submit', '.submit_me', function(event, element) {
				event.preventDefault();
				element.set('data-submitted', 'true');
			}
		);

		var form = new Element('form#form2.submit_me[data-submitted=false]');
		body.grab(form);

		body.fireEvent('focusin', {target: form});
		form.fireEvent('submit', {preventDefault: function() {}});

		$Y.Assert.areSame('false', $C.document.id('form1').get('data-submitted'));
		$Y.Assert.areSame('true', form.get('data-submitted'));
	}
};
