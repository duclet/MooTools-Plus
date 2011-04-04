YUITest.TestCases.AutoCompleteJS = {
	name: 'Tests for Interface/AutoComplete.js',

	testGetDisplayText: function() {
		var autocomplete = new $C.AutoCompleteJS(YUITest.TestCases.AutoCompleteJS.server);
		autocomplete.input = $C.document.getElement('.autocomplete1');
		autocomplete.input.value = 10;

		$Y.Assert.areSame(
			'Some Value <span class="provided">10</span>',
			autocomplete.getDisplayText('Some Value 10')
		);

		autocomplete.input.value = 'value';
		$Y.Assert.areSame(
			'Some <span class="provided">Value</span> 10',
			autocomplete.getDisplayText('Some Value 10')
		);

		$Y.Assert.areSame(
			'Some <span class="provided">Value</span> other <span class="provided">value</span>',
			autocomplete.getDisplayText('Some Value other value')
		);
	},

	//testFunctionServer: function() {
	//	var autocomplete = new $C.AutoCompleteJS(server);
	//	autocomplete.attach('.autocomplete1');
	//},

	server: function(autocompletejs) {
		var raw = [
			{value: 'value1', display: 'Display 1'},
			{value: 'value2', display: 'Display 2'},
			{value: 'value3', display: 'Display 3'},
			{value: 'value4', display: 'Display 4'},
			{value: 'value5', display: 'Display 5'},
			{value: 'value6', display: 'Display 6'},
			{value: 'value7', display: 'Display Display 7'},
			{value: 'value8', display: 'Display 8'},
			{value: 'value9', display: 'Display 9'},
			{value: 'value10', display: 'Display 10'}
		];

		var provided = autocompletejs.input.get('value').toLowerCase();
		var suggestions = raw.filter(function(item) {
			if((item.value.toLowerCase().indexOf(provided) !== -1) ||
			   (item.display.toLowerCase().indexOf(provided) !== -1)) {
				return true;
			} else { return false; }
		});

		return suggestions;
	}
};
