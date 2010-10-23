<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>Tester</title>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js"></script>
		<script type="text/javascript" src="/tests/yuitest/yuitest.js"></script>
		<script type="text/javascript" src="/tests/mootools-plus/mootools-core.js"></script>
		<script type="text/javascript" src="/tests/mootools-plus/mootools-more.js"></script>
		<script type="text/javascript" src="/tests/mootools-plus/mootools-plus.js"></script>
		<?php
			$test_cases_dir = new DirectoryIterator(implode(
				DIRECTORY_SEPARATOR,
				array(dirname(__FILE__), 'test_cases')
			));

			$test_cases = array();
			foreach($test_cases_dir as $item) {
				if($item->isFile()) {
					printf(
						'<script type="text/javascript" src="/tests/mootools-plus/test_cases/%s"></script>',
						$item->getBasename()
					);
				}
			}
		?>
	</head>
	<body class="yui3-skin-sam">
		<div id="logger"></div>
		<script type="text/javascript">
		YUITest.Tester.initialize();
		</script>
	</body>
</html>
