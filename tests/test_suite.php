<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>Test Suite</title>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js"></script>
		<script type="text/javascript" src="/tests/yuitest/yuitest.js"></script>
	</head>
	<body class="yui3-skin-sam">
		<div id="logger"></div>
		<script type="text/javascript">
		// Overwrite the default configurations
		YUITest.Configs.set({
			testee_type: 'iframe',
			tester_type: 'iframe',
			tester_url_tpt: '{protocol}//{host}/tests/mootools-plus/tester.php',
			pages: [<?php
				$pages_dir = new DirectoryIterator(implode(
					DIRECTORY_SEPARATOR,
					array(dirname(__FILE__), 'pages')
				));

				$pages = array();
				foreach($pages_dir as $item) {
					if($item->isFile()) {
						array_push($pages, sprintf(
							"'/tests/mootools-plus/pages/%s'",
							$item->getBasename()
						));
					}
				}

				sort($pages);
				echo implode(', ', $pages);
			?>]
		});

		YUITest.TestSuite.initialize();
		</script>
	</body>
</html>
