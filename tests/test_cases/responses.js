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
				message: 'The alerted message'
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
	},

	testRedirect: function() {
		// We need to override the redirect response handler since we'll lose
		// the page if it got redirected
		var modified = new $C.Class({
			Extends: $C.ResponsesJS,
			$called: false,
			$url: '',
			redirectResponse: function(responsesjs, response) {
				if(response.type === 'redirect') {
					this.$called = true;
					this.$url = response.url;
				}
			}
		});

		var responses = new modified({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'redirect',
				url: 'http://www.google.com'
			}]),
			onFinishProcessing: function(responsesjs) {
				this.resume(function() {
					$Y.Assert.isTrue(responsesjs.$called);
					$Y.Assert.areSame('http://www.google.com', responsesjs.$url);
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testReload: function() {
		// We need to override the reload response handler since we'll lose
		// the page if it got reloaded
		var modified = new $C.Class({
			Extends: $C.ResponsesJS,
			$called: false,
			reloadResponse: function(responsesjs, response) {
				if(response.type === 'reload') {
					this.$called = true;
				}
			}
		});

		var responses = new modified({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([{
				type: 'reload'
			}]),
			onFinishProcessing: function(responsesjs) {
				this.resume(function() {
					$Y.Assert.isTrue(responsesjs.$called);
				});
			}.bind(this)
		});

		responses.send();
		this.wait(2000);
	},

	testMultipleResponses: function() {
		var callback1 = function() { callback1.$called = true; };
		var callback2 = function() { callback2.$called = true; };
		var callback3 = function() { callback3.$called = true; };

		$Y.Assert.isUndefined(callback1.$called);
		$Y.Assert.isUndefined(callback2.$called);
		$Y.Assert.isUndefined(callback3.$called);

		var responses = new $C.ResponsesJS({
			url: '/tests/mootools-plus/responses.php',
			data: 'data=' + JSON.encode([
				{ type: 'callback', key: 'callback1' },
				{ type: 'callback', key: 'callback2' },
				{ type: 'callback', key: 'callback3' }
			]),
			onFinishProcessing: function(responsesjs) {
				this.resume(function() {
					$Y.Assert.isTrue(callback1.$called);
					$Y.Assert.isTrue(callback2.$called);
					$Y.Assert.isTrue(callback3.$called);
				});
			}.bind(this)
		});

		responses.addHandler('callback1', callback1);
		responses.addHandler('callback2', callback2);
		responses.addHandler('callback3', callback3);

		responses.send();
		this.wait(2000);
	}
};
