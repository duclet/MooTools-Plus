YUITest.TestCases.ResponsesJS = {
	name: 'Tests for Request/Responses.js',

	testAlert: function() {
		// We need to override the alert response handler since we can't
		// actually test an alerted message
		var modified = new $C.Class({
			Extends: $C.ResponsesJS,
			$called: false,
			$message: '',
			alertResponse: function(responsesjs, response) {
				if(response.type === 'alert') {
					this.$called = true;
					this.$message = response.message;
				}
			}
		});

		var responses = new modified({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'alert',
				message: 'The alerted message',
			}]),
			onFinishProcessing: function(responsesjs) {
				this.resume(function() {
					$Y.Assert.isTrue(responsesjs.$called);
					$Y.Assert.areSame('The alerted message', responsesjs.$message);
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testCallbackWithNoParamters: function() {
		var callback = function() {
			this.resume(function() { $Y.Assert.isTrue(true); });
		}.bind(this);

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'callback',
				key: 'mycallback'
			}])
		});

		responses.addHandler('mycallback', callback);
		responses.send();
		this.wait(2000);
	},

	testCallbackWithParameters: function() {
		var callback = function(arg1, arg2) {
			this.resume(function() {
				$Y.Assert.isTrue(arg1);
				$Y.Assert.areSame('arg2', arg2);
			});
		}.bind(this);

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'callback',
				key: 'mycallback',
				parameters: [true, 'arg2']
			}])
		});

		responses.addHandler('mycallback', callback);
		responses.send();
		this.wait(2000);
	},

	testElementReplaceWithoutJavaScript: function() {
		$Y.Assert.isNotNull($C.document.id('replace_me1'));

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'element_replace',
				element_id: 'replace_me1',
				html: '<div id="replaced1">I have been replaced.</div>'
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					$Y.Assert.isNull($C.document.id('replace_me1'));

					var replaced = $C.document.id('replaced1');
					$Y.Assert.isNotNull(replaced);
					$Y.Assert.areSame('I have been replaced.', replaced.get('html'));
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testElementReplaceWithJavaScript: function() {
		$Y.Assert.isFalse($C.replaced_with_js);
		$Y.Assert.isNotNull($C.document.id('replace_me2'));

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'element_replace',
				element_id: 'replace_me2',
				html: '<div id="replaced2">I have been replaced.</div>' +
					'<script type="text/javascript">' +
						'window.replaced_with_js = true;' +
					'</script>'
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					$Y.Assert.isTrue($C.replaced_with_js);
					$Y.Assert.isNull($C.document.id('replace_me2'));
					$Y.Assert.isNotNull($C.document.id('replaced2'));
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testElementUpdateWithoutJavaScript: function() {
		$Y.Assert.isNotNull($C.document.id('update_me1'));

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'element_update',
				element_id: 'update_me1',
				html: 'I have been updated.'
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					var updated = $C.document.id('update_me1');
					$Y.Assert.isNotNull(updated);
					$Y.Assert.areSame('I have been updated.', updated.get('html'));
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testElementUpdateWithJavaScript: function() {
		$Y.Assert.isFalse($C.updated_with_js);
		$Y.Assert.isNotNull($C.document.id('update_me2'));

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'element_update',
				element_id: 'update_me2',
				html: '<div>I have been updated.</div>' +
					'<script type="text/javascript">' +
						'window.updated_with_js = true;' +
					'</script>'
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					$Y.Assert.isTrue($C.updated_with_js);
					$Y.Assert.isNotNull($C.document.id('update_me2'));
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testFunctionCallWithoutArgs: function() {
		$Y.Assert.isFalse($C.called);

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'function_call',
				fn: 'call_me',
				scope: 'window'
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					$Y.Assert.isTrue($C.called);
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testFunctionCallWithArgs: function() {
		$Y.Assert.isFalse($C.calledWithArgs);

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'function_call',
				fn: 'call_me_with_args',
				scope: 'window',
				parameters: [true]
			}]),
			onFinishProcessing: function() {
				this.resume(function() {
					$Y.Assert.isTrue($C.calledWithArgs);
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	}
};
