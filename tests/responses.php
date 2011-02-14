<?php
// This file simply echo out the provided data (which is expected to be a JSON)
header('Content-type: application/json');

// If the session key is provided, use that instead
if(isset($_REQUEST['session_key'])) {
	session_start();
	echo $_SESSION[$_REQUEST['session_key']];
} else {
	echo $_REQUEST['data'];
}
