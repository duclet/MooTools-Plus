<?php
// This file simply echo out the provided data (which is expected to be a JSON)
header('Content-type: application/json');
echo $_REQUEST['data'];
